// src/main/java/com/example/asplatform/repairRequest/service/RepairRequestService.java
package com.example.asplatform.repairRequest.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestSimpleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.common.enums.StatusGroup;
import com.example.asplatform.item.domain.RepairableItem;
import com.example.asplatform.item.repository.RepairableItemRepository;
import com.example.asplatform.notify.service.NotificationEventHandler;
import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairHistory.repository.RepairHistoryRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.dto.requestDTO.RepairRequestCreateDto;
import com.example.asplatform.repairRequest.dto.responseDTO.CustomerRepairRequestListDto;
import com.example.asplatform.repairRequest.dto.responseDTO.RepairRequestListDto;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.domain.UserAddress;
import com.example.asplatform.user.repository.UserAddressRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RepairRequestService {

    private final RepairRequestRepository repairRequestRepository;
    private final RepairHistoryRepository repairHistoryRepository;
    private final RepairableItemRepository repairableItemRepository;
    private final UserAddressRepository userAddressRepository;
    private final NotificationEventHandler notificationEventHandler; // ✅ 알림 훅

    /**
     * 수리 요청 등록
     */
    @Transactional
    public Long createRepairRequest(User user, RepairRequestCreateDto dto) {
        // 1) 연관 엔티티 조회
        RepairableItem item = repairableItemRepository.findById(dto.getRepairableItemId())
                .orElseThrow(() -> new IllegalArgumentException("제품 정보가 잘못되었습니다."));

        // 2) 수리 요청 저장
        RepairRequest repairRequest = RepairRequest.builder()
                .user(user)
                .repairableItem(item)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .contactPhone(dto.getContactPhone())
                .status(RepairStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        repairRequestRepository.save(repairRequest);

        // 3) 상태 변경 이력 저장
        RepairHistory history = RepairHistory.builder()
                .repairRequest(repairRequest)
                .previousStatus(RepairStatus.PENDING)
                .newStatus(RepairStatus.PENDING)
                .changedBy(user) // User 엔티티
                .memo("관리자 접수/반려 선택 전 상태")
                .build();

        repairHistoryRepository.save(history);

        return repairRequest.getRequestId();
    }

    /**
     * 고객 본인의 수리 요청 목록 (상태 그룹 + 키워드)
     */
    public Page<RepairRequestListDto> getUserRepairRequests(User user, StatusGroup statusGroup,
                                                            String keyword, Pageable pageable) {
        Set<RepairStatus> statusList = statusGroup.toStatusSet();

        return repairRequestRepository
                .findByUserIdAndStatusesWithKeyword(user.getId(), statusList, keyword, pageable)
                .map(RepairRequestListDto::from);
    }

    /**
     * 수리기사 본인에게 할당된 수리 요청 목록
     */
    public Page<RepairRequestListDto> getEngineerRequestList(User user, RepairStatus status, Long categoryId,
                                                             String keyword, int page, int size) {
        Long engineerId = user.getId();
        Pageable pageable = PageRequest.of(Math.max(0, page),
                (size <= 0 || size > 100) ? 20 : size,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<RepairRequest> result = repairRequestRepository.findEngineerList(
                engineerId, status, categoryId,
                (keyword == null || keyword.isBlank()) ? null : keyword.trim(),
                pageable
        );

        // 주소 배치 로딩
        List<Long> userIds = result.getContent().stream()
                .map(rr -> rr.getUser().getId())
                .distinct()
                .toList();

        Map<Long, UserAddress> addrMap = userAddressRepository.findByUserIds(userIds).stream()
                .collect(Collectors.toMap(a -> a.getUser().getId(), Function.identity()));

        List<RepairRequestListDto> content = result.getContent().stream()
                .map(rr -> {
                    RepairRequestListDto dto = RepairRequestListDto.from(rr);
                    UserAddress ad = addrMap.get(rr.getUser().getId());
                    if (ad != null) {
                        dto.setPostalCode(ad.getPostalCode());
                        dto.setRoadAddress(ad.getRoadAddress());
                        dto.setDetailAddress(ad.getDetailAddress());
                    }
                    return dto;
                })
                .toList();

        return new PageImpl<>(content, result.getPageable(), result.getTotalElements());
    }

    /**
     * 고객사 요청 목록
     */
    public Page<CustomerRepairRequestListDto> getCustomerRequestList(Long customerId, String keyword,
                                                                     Long categoryId, RepairStatus status,
                                                                     Pageable pageable) {
        return repairRequestRepository.findCustomerList(customerId, keyword, categoryId, status, pageable);
    }

    // ✅ accept: PENDING → WAITING_FOR_REPAIR + 알림 발송
    @Transactional
    public RepairRequestSimpleResponse accept(Long requestId, User actor, String memo) {
        RepairRequest rr = repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("수리 요청을 찾을 수 없습니다. id=" + requestId));

        RepairStatus prev = rr.getStatus();
        if (prev == RepairStatus.CANCELED || prev == RepairStatus.COMPLETED) {
            throw new IllegalStateException("이미 종료된 요청은 접수할 수 없습니다.");
        }

        rr.setStatus(RepairStatus.WAITING_FOR_REPAIR);

        repairHistoryRepository.save(RepairHistory.builder()
                .repairRequest(rr)
                .previousStatus(prev)
                .newStatus(RepairStatus.WAITING_FOR_REPAIR)
                .changedBy(actor)
                .memo(memo)
                .build());

        // 🔔 알림: 기사(있으면) + 고객
        Long engineerId = (rr.getEngineer() != null) ? rr.getEngineer().getId() : null;
        Long customerId = rr.getUser() != null ? rr.getUser().getId() : null;
        notificationEventHandler.onStatusChanged(engineerId, customerId, RepairStatus.WAITING_FOR_REPAIR);

        return RepairRequestSimpleResponse.of(rr.getRequestId(), rr.getStatus());
    }

    // ✅ reject: ANY → CANCELED + 알림 발송
    @Transactional
    public RepairRequestSimpleResponse reject(Long requestId, User actor, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("반려 사유는 필수입니다.");
        }

        RepairRequest rr = repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("수리 요청을 찾을 수 없습니다. id=" + requestId));

        RepairStatus prev = rr.getStatus();
        if (prev == RepairStatus.CANCELED || prev == RepairStatus.COMPLETED) {
            throw new IllegalStateException("이미 종료된 요청은 반려할 수 없습니다.");
        }

        rr.setStatus(RepairStatus.CANCELED);

        repairHistoryRepository.save(RepairHistory.builder()
                .repairRequest(rr)
                .previousStatus(prev)
                .newStatus(RepairStatus.CANCELED)
                .changedBy(actor)
                .memo(reason)
                .build());

        // 🔔 알림: 기사(있으면) + 고객
        Long engineerId = (rr.getEngineer() != null) ? rr.getEngineer().getId() : null;
        Long customerId = rr.getUser() != null ? rr.getUser().getId() : null;
        notificationEventHandler.onStatusChanged(engineerId, customerId, RepairStatus.CANCELED);

        return RepairRequestSimpleResponse.of(rr.getRequestId(), rr.getStatus());
    }
}
