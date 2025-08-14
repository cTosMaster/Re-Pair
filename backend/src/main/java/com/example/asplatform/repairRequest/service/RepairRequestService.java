package com.example.asplatform.repairRequest.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.common.enums.Role;
import com.example.asplatform.common.enums.StatusGroup;
import com.example.asplatform.item.domain.RepairableItem;
import com.example.asplatform.item.repository.RepairableItemRepository;
import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairHistory.repository.RepairHistoryRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.dto.requestDTO.DeleteRepairRequestsRequestDto;
import com.example.asplatform.repairRequest.dto.requestDTO.RepairRequestCreateDto;
import com.example.asplatform.repairRequest.dto.responseDTO.CustomerRepairRequestListDto;
import com.example.asplatform.repairRequest.dto.responseDTO.DeleteRepairRequestsResponseDto;
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

	/**
	 * 수리 요청 등록
	 * 
	 * @param userId
	 * @param dto
	 * @return
	 */
	@Transactional
	public Long createRepairRequest(User user, RepairRequestCreateDto dto) {

		// 1. 연관 엔티티 조회
		RepairableItem item = repairableItemRepository.findById(dto.getRepairableItemId())
				.orElseThrow(() -> new IllegalArgumentException("제품 정보가 잘못되었습니다."));

		// 2. 수리 요청 저장
		RepairRequest repairRequest = RepairRequest.builder().user(user).repairableItem(item).title(dto.getTitle())
				.description(dto.getDescription()).contactPhone(dto.getContactPhone()).status(RepairStatus.PENDING)
				.createdAt(LocalDateTime.now()).build();

		repairRequestRepository.save(repairRequest);

		// 3. 상태 변경 이력 저장
		RepairHistory history = RepairHistory.builder().repairRequest(repairRequest)
				.previousStatus(RepairStatus.PENDING).newStatus(RepairStatus.PENDING).changedBy(user) // User엔티티 직접 전달
				.memo("관리자 접수/반려 선택 전 상태").build();

		repairHistoryRepository.save(history);

		return repairRequest.getRequestId();
	}

	/**
	 * 고객 본인의 수리 요청 목록을 상태 그룹과 키워드로 조회.
	 * 
	 * @param userId      사용자 ID
	 * @param statusGroup 상태 그룹 (IN_PROGRESS, COMPLETED, CANCELED)
	 * @param keyword     제목 또는 제품명 키워드 (nullable)
	 * @param pageable    페이징 정보
	 * @return 수리 요청 목록 응답 페이지
	 */
	public Page<RepairRequestListDto> getUserRepairRequests(User user, StatusGroup statusGroup, String keyword,
			Pageable pageable) {
		Set<RepairStatus> statusList = statusGroup.toStatusSet();

		return repairRequestRepository.findByUserIdAndStatusesWithKeyword(user.getId(), statusList, keyword, pageable)
				.map(RepairRequestListDto::from);
	}

	/**
	 * 수리기사 본인에게 할당된 수리 요청 목록 조회
	 * 
	 * @param engineerId
	 * @param keyword
	 * @param page
	 * @param size
	 * @return
	 */
	public Page<RepairRequestListDto> getEngineerRequestList(User user, RepairStatus status, Long categoryId, String keyword, int page,
			int size) {

		Long engineerId = user.getId();
		Pageable pageable = PageRequest.of(Math.max(0, page), (size <= 0 || size > 100) ? 20 : size,
				Sort.by(Sort.Direction.DESC, "createdAt"));

		Page<RepairRequest> result = repairRequestRepository.findEngineerList(engineerId, status, categoryId,
				(keyword == null || keyword.isBlank()) ? null : keyword.trim(), pageable);

		// 주소 배치 로딩
		List<Long> userIds = result.getContent().stream().map(rr -> rr.getUser().getId()).distinct().toList();

		Map<Long, UserAddress> addrMap = userAddressRepository.findByUserIds(userIds).stream()
				.collect(Collectors.toMap(a -> a.getUser().getId(), Function.identity()));

		// 고객용 DTO 재사용 + 전화번호 포맷팅 동일 적용
		List<RepairRequestListDto> content = result.getContent().stream().map(rr -> {
			// DTO.from(entity) 그대로 쓰되, 전화 포맷팅 규칙을 고객용과 동일하게 유지
			RepairRequestListDto dto = RepairRequestListDto.from(rr);
			// 주소 세팅
			UserAddress ad = addrMap.get(rr.getUser().getId());
			if (ad != null) {
				dto.setPostalCode(ad.getPostalCode());
				dto.setRoadAddress(ad.getRoadAddress());
				dto.setDetailAddress(ad.getDetailAddress());
			}
			return dto;
		}).toList();

		return new PageImpl<>(content, result.getPageable(), result.getTotalElements());
	}

	
	
	
	/**
	 * 해당 고객사에 소속된 수리 요청 목록 조회
	 * 
	 * @param customerId
	 * @param keyword
	 * @param categoryId
	 * @param status
	 * @param pageable
	 * @return
	 */
	public Page<CustomerRepairRequestListDto> getCustomerRequestList(Long customerId, String keyword, Long categoryId,
			RepairStatus status, Pageable pageable) {

		return repairRequestRepository.findCustomerList(customerId, keyword, categoryId, status, pageable);
	}
	
	
	@Transactional
    public DeleteRepairRequestsResponseDto deleteRequests(DeleteRepairRequestsRequestDto req, User user) {
		
		System.out.println(user);
		
        if (user.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException("고객사 관리자만 삭제할 수 있습니다.");
        }
        
        Long customerId = user.getCustomer().getId();
        Long userId = user.getId();
        
        // 상태 허용 조건
        var allowedStatuses = List.of(RepairStatus.CANCELED, RepairStatus.COMPLETED);

        // 삭제 가능한 대상 id 선별
        List<Long> requested = req.ids();
        List<Long> deletableIds = repairRequestRepository.findDeletableIds(requested, customerId, allowedStatuses);

        // 소프트 딜리트
        int deletedCount = 0;
        if (!deletableIds.isEmpty()) {
        	deletedCount = repairRequestRepository.softDeleteByIds(deletableIds, userId, allowedStatuses);
        }

        // 스킵된 ID 계산
        var skipped = new ArrayList<>(new HashSet<>(requested));
        skipped.removeAll(deletableIds);

        String msg = "삭제 처리 완료";
        if (!skipped.isEmpty()) {
            msg += " (권한 없음/상태 불가/이미 삭제/존재하지 않음: " + skipped.size() + "건)";
        }
        return new DeleteRepairRequestsResponseDto(deletedCount, skipped, msg);
    }
	
	

}
