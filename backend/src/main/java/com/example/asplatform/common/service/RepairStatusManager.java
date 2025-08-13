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
import com.example.asplatform.user.domain.User;

@Service
@RequiredArgsConstructor
public class RepairStatusManager {

    private final RepairRequestRepository repairRequestRepository;
    private final RepairHistoryRepository repairHistoryRepository;

    /**
     * 수리 상태 변경 처리 (공통 로직)
     */
    @Transactional
    public void changeStatus(Long requestId, RepairStatus targetStatus, User actor, String memo) {
        // 1. 수리 요청 조회
        RepairRequest repairRequest = repairRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("해당 수리 요청이 존재하지 않습니다."));

        RepairStatus currentStatus = repairRequest.getStatus();

        // 2. 수동 상태 변경 유효성 검사
        if (!isValidTransition(currentStatus, targetStatus, actor)) {
            throw new IllegalStateException(String.format(
                "상태 변경 불가: %s → %s", currentStatus, targetStatus
            ));
        }
        
        // 3. 수동 변경일 경우 memo 필수 검사
        if (isManualChange(targetStatus, actor.getRole()) && (memo == null || memo.isBlank())) {
            throw new IllegalArgumentException("수동 상태 변경 시 사유(memo)를 입력해야 합니다.");
        }

        // 4. 상태 변경
        repairRequest.setStatus(targetStatus);
        // repairRequestRepository.save(repairRequest);

        // 4. 변경 이력 저장
        String historyMemo;
        
        if (isManualChange(targetStatus, actor.getRole())) {
            historyMemo = memo; // 수동이면 사용자가 입력한 메모
        } else {
            // 자동 처리용 메모 템플릿
            historyMemo = getAutoMemo(currentStatus, targetStatus);
        }
        
        RepairHistory history = RepairHistory.builder()
                .repairRequest(repairRequest)
                .previousStatus(currentStatus)
                .newStatus(targetStatus)
                .changedBy(actor)
                .memo(historyMemo) // 여기에 memo 추가
                .build();

        repairHistoryRepository.save(history);
    }

    /**
     * 상태 변경 유효성 검사
     */
    private boolean isValidTransition(RepairStatus from, RepairStatus to, User actor) {
        Role role = actor.getRole();

        // 수동 변경 허용 유효성 검사
        if (isManualChange(to, role)) {
            // 예외 조건: COMPLETED 이후에는 CANCELED 불가 (비즈니스 룰)
            if (to == RepairStatus.CANCELED && from == RepairStatus.COMPLETED) {
                return false;
            }
            return true; // 수동 변경 허용됨
        }

        // 자동 상태 흐름
        return switch (from) {
            case PENDING -> to == RepairStatus.WAITING_FOR_REPAIR;
            case WAITING_FOR_REPAIR -> to == RepairStatus.IN_PROGRESS;
            case IN_PROGRESS -> to == RepairStatus.WAITING_FOR_PAYMENT;
            case WAITING_FOR_PAYMENT -> to == RepairStatus.WAITING_FOR_DELIVERY;
            case WAITING_FOR_DELIVERY -> to == RepairStatus.COMPLETED;
            default -> false;
        };
    }
    
    private boolean isManualChange(RepairStatus to, Role role) {
    	return to.canManuallyChange(role);
    }
    
    private String getAutoMemo(RepairStatus from, RepairStatus to) {
        return switch (to) {
            case WAITING_FOR_REPAIR -> "수리 요청이 승인되어 기사 배정 상태";
            case IN_PROGRESS -> "수리기사 1차 견적 작성 완료되어 수리 중 상태";
            case WAITING_FOR_PAYMENT -> "수리가 완료되어 입금 대기 상태";
            case WAITING_FOR_DELIVERY -> "입금이 확인되어 발송 대기 상태";
            case COMPLETED -> "배송이 완료되어 수리 완료 상태";
            default -> "시스템에 의해 상태가 자동으로 변경되었습니다.";
        };
    }
}