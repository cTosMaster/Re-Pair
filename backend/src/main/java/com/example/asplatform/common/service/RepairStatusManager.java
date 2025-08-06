package com.example.asplatform.common.service;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.common.enums.Role;
import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairHistory.repository.RepairHistoryRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;
import com.example.asplatform.user.domain.Users;

@Service
@RequiredArgsConstructor
public class RepairStatusManager {

    private final RepairRequestRepository repairRequestRepository;
    private final RepairHistoryRepository repairHistoryRepository;

    /**
     * 수리 상태 변경 처리 (공통 로직)
     */
    @Transactional
    public void changeStatus(Long requestId, RepairStatus targetStatus, Users actor) {
        // 1. 수리 요청 조회
        RepairRequest repairRequest = repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("해당 수리 요청이 존재하지 않습니다."));

        RepairStatus currentStatus = repairRequest.getStatus();

        // 2. 상태 전이 유효성 검사
        if (!isValidTransition(currentStatus, targetStatus, actor)) {
            throw new IllegalStateException(String.format(
                "상태 전이 불가: %s → %s", currentStatus, targetStatus
            ));
        }

        // 3. 상태 변경
        repairRequest.setStatus(targetStatus);
        repairRequestRepository.save(repairRequest);

        // 4. 변경 이력 저장
        RepairHistory history = RepairHistory.builder()
                .repairRequest(repairRequest)
                .previousStatus(currentStatus)
                .newStatus(targetStatus)
                .changedBy(actor.getName())
                .build();

        repairHistoryRepository.save(history);
    }

    /**
     * 상태 전이 유효성 검사
     */
    private boolean isValidTransition(RepairStatus from, RepairStatus to, Users actor) {
        Role role = actor.getRole();

        // 관리자: 모든 상태 전이 허용 (단 COMPLETED 이후는 불가)
        if (role == Role.ADMIN) {
            return from != RepairStatus.COMPLETED;
        }

        // 수리기사: 수동 취소 가능 상태만 허용
        if (to == RepairStatus.CANCELED && role == Role.ENGINEER) {
            return from == RepairStatus.WAITING_FOR_REPAIR || from == RepairStatus.IN_PROGRESS;
        }

        // 일반 상태 흐름
        return switch (from) {
            case PENDING -> to == RepairStatus.WAITING_FOR_REPAIR;
            case WAITING_FOR_REPAIR -> to == RepairStatus.IN_PROGRESS;
            case IN_PROGRESS -> to == RepairStatus.WAITING_FOR_PAYMENT;
            case WAITING_FOR_PAYMENT -> to == RepairStatus.WAITING_FOR_DELIVERY;
            case WAITING_FOR_DELIVERY -> to == RepairStatus.COMPLETED;
            default -> false;
        };
    }
}