package com.example.asplatform.repairRequest.service;

import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.item.domain.RepairableItem;
import com.example.asplatform.item.repository.RepairableItemRepository;
import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairHistory.repository.RepairHistoryRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.dto.requestDTO.RepairRequestCreateDto;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;
import com.example.asplatform.user.domain.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RepairRequestService {
	
	private final RepairRequestRepository repairRequestRepository;
	private final RepairHistoryRepository repairHistoryRepository;
	private final RepairableItemRepository repairableItemRepository;

	
	/**
	 * 수리 요청 등록
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

        // 3. 상태 변경 이력 저장
        RepairHistory history = RepairHistory.builder()
                .repairRequest(repairRequest)
                .previousStatus(RepairStatus.PENDING)
                .newStatus(RepairStatus.PENDING)
                .changedBy(user) // User엔티티 직접 전달
                .memo("관리자 접수/반려 선택 전 상태")
                .build();

        repairHistoryRepository.save(history);

        return repairRequest.getRequestId();
    }
}
