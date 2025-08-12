// src/main/java/com/example/asplatform/repairRequest/service/RepairRequestServiceImpl.java
package com.example.asplatform.repairRequest.service;

import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.engineer.repository.EngineerRepository;
import com.example.asplatform.notify.service.NotificationEventHandler;
import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairHistory.repository.RepairHistoryRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RepairRequestServiceImpl implements RepairRequestService {

    private final RepairRequestRepository requestRepo;
    private final EngineerRepository engineerRepo;
    private final RepairHistoryRepository historyRepo;
    private final NotificationEventHandler notificationEventHandler;

    /**
     * PENDING -> WAITING_FOR_REPAIR (담당자 배정 필수)
     */
    @Override
    public void accept(Long requestId, Long engineerUserId) {
        RepairRequest req = requestRepo.findById(requestId).orElseThrow();
        RepairStatus prev = req.getStatus();

        // 엔지니어 존재 확인
        engineerRepo.findById(engineerUserId).orElseThrow();

        if (prev != RepairStatus.PENDING) {
            throw new IllegalStateException("현재 상태에서 '접수'할 수 없습니다: " + prev);
        }

        // 이미 같은 엔지니어로 배정 + 대기 상태면 멱등 처리
        if (Objects.equals(req.getEngineerId(), engineerUserId) &&
            req.getStatus() == RepairStatus.WAITING_FOR_REPAIR) {
            return;
        }

        req.setEngineerId(engineerUserId);
        req.setStatus(RepairStatus.WAITING_FOR_REPAIR);

        // 이력 기록
        historyRepo.save(RepairHistory.builder()
                .requestId(requestId)
                .changedBy(null) // 필요 시 관리자/시스템 ID 넣기
                .previousStatus(prev)
                .newStatus(RepairStatus.WAITING_FOR_REPAIR)
                .changedAt(LocalDateTime.now())
                .memo("접수/배정 완료")
                .build());

        // 알림 (기사/고객)
        notificationEventHandler.onStatusChanged(engineerUserId, req.getUserId(), RepairStatus.WAITING_FOR_REPAIR);
    }

    /**
     * ANY -> CANCELED (이미 COMPLETED/CANCELED면 불가)
     */
    @Override
    public void reject(Long requestId, String reason) {
        RepairRequest req = requestRepo.findById(requestId).orElseThrow();
        RepairStatus prev = req.getStatus();

        if (prev == RepairStatus.COMPLETED || prev == RepairStatus.CANCELED) {
            throw new IllegalStateException("이미 완료/취소된 요청입니다.");
        }

        // 동일 상태면 멱등 처리
        if (prev == RepairStatus.CANCELED) return;

        req.setStatus(RepairStatus.CANCELED);

        historyRepo.save(RepairHistory.builder()
                .requestId(requestId)
                .changedBy(null)
                .previousStatus(prev)
                .newStatus(RepairStatus.CANCELED)
                .changedAt(LocalDateTime.now())
                .memo(reason != null ? reason : "접수 반려/취소")
                .build());

        // 알림 (배정되어 있으면 기사에게도, 고객은 항상)
        notificationEventHandler.onStatusChanged(req.getEngineerId(), req.getUserId(), RepairStatus.CANCELED);
    }

    /**
     * 배정/재배정.
     * - PENDING이면 WAITING_FOR_REPAIR로 전환하며 접수 알림 발송
     * - 그 외 단계에선 상태 유지 + (선택적으로) 기사에게만 새 작업 알림
     */
    @Override
    public void assignEngineer(Long requestId, Long engineerUserId) {
        RepairRequest req = requestRepo.findById(requestId).orElseThrow();
        RepairStatus prev = req.getStatus();

        engineerRepo.findById(engineerUserId).orElseThrow();

        // 동일 엔지니어 재배정 멱등 처리
        if (Objects.equals(req.getEngineerId(), engineerUserId)) {
            // PENDING이면 아래 로직에서 접수로 전환; 이미 대기/진행 중이면 스킵
            if (prev != RepairStatus.PENDING) return;
        }

        req.setEngineerId(engineerUserId);

        if (prev == RepairStatus.PENDING) {
            // 배정과 동시에 접수 처리
            req.setStatus(RepairStatus.WAITING_FOR_REPAIR);

            historyRepo.save(RepairHistory.builder()
                    .requestId(requestId)
                    .changedBy(null)
                    .previousStatus(prev)
                    .newStatus(RepairStatus.WAITING_FOR_REPAIR)
                    .changedAt(LocalDateTime.now())
                    .memo("배정과 함께 접수")
                    .build());

            // 기사/고객 모두 알림
            notificationEventHandler.onStatusChanged(engineerUserId, req.getUserId(), RepairStatus.WAITING_FOR_REPAIR);
        } else {
            // 상태 유지 재배정
            historyRepo.save(RepairHistory.builder()
                    .requestId(requestId)
                    .changedBy(null)
                    .previousStatus(prev)
                    .newStatus(prev)
                    .changedAt(LocalDateTime.now())
                    .memo("담당자 재배정: engineerUserId=" + engineerUserId)
                    .build());

            // 필요 시 기사에게만 새 작업 알림 주고 싶으면 주석 해제
            // notificationEventHandler.onStatusChanged(engineerUserId, null, prev);
        }
    }
}
