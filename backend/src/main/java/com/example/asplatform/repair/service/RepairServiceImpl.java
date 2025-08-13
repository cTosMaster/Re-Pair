package com.example.asplatform.repair.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.notify.service.NotificationEventHandler;
import com.example.asplatform.repair.domain.Repair;
import com.example.asplatform.repair.repository.RepairRepository;
import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairHistory.repository.RepairHistoryRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RepairServiceImpl implements RepairService {

    private final RepairRequestRepository requestRepo;
    private final RepairRepository repairRepo;
    private final RepairHistoryRepository historyRepo;
    private final UserRepository userRepo;
    private final NotificationEventHandler notificationEventHandler;

    /**
     * WAITING_FOR_REPAIR -> IN_PROGRESS
     */
    @Override
    public void startRepair(Long requestId, String engineerLoginEmail) {
        User engineer = userRepo.findByEmail(engineerLoginEmail).orElseThrow();

        RepairRequest req = requestRepo.findById(requestId).orElseThrow();
        RepairStatus prev = req.getStatus();

        if (req.getEngineerId() == null || !req.getEngineerId().equals(engineer.getId())) {
            throw new SecurityException("이 요청의 배정 엔지니어가 아닙니다.");
        }
        if (prev != RepairStatus.WAITING_FOR_REPAIR) {
            throw new IllegalStateException("현재 상태에서 '수리 시작' 할 수 없습니다: " + prev);
        }

        // 동일 상태 멱등 처리
        if (req.getStatus() == RepairStatus.IN_PROGRESS) return;

        req.setStatus(RepairStatus.IN_PROGRESS);

        historyRepo.save(RepairHistory.builder()
                .repairRequest(req)         
                .changedBy(engineer)
                .previousStatus(prev)
                .newStatus(RepairStatus.IN_PROGRESS)
                .changedAt(LocalDateTime.now())
                .memo("엔지니어 수리 시작")
                .build());

        notificationEventHandler.onStatusChanged(req.getEngineerId(), req.getUserId(), RepairStatus.IN_PROGRESS);
    }

    /**
     * IN_PROGRESS -> WAITING_FOR_PAYMENT (+repairs upsert)
     */
    @Override
    public void completeRepair(Long requestId, String engineerLoginEmail, int finalPrice, String description) {
        User engineer = userRepo.findByEmail(engineerLoginEmail).orElseThrow();

        RepairRequest req = requestRepo.findById(requestId).orElseThrow();
        RepairStatus prev = req.getStatus();

        if (req.getEngineerId() == null || !req.getEngineerId().equals(engineer.getId())) {
            throw new SecurityException("이 요청의 배정 엔지니어가 아닙니다.");
        }
        if (prev != RepairStatus.IN_PROGRESS) {
            throw new IllegalStateException("현재 상태에서 '수리 완료' 입력이 불가합니다: " + prev);
        }

        RepairRequest reqEntity = requestRepo.getReferenceById(requestId);
        Repair rep = repairRepo.findByRequestId(requestId)
                .orElse(Repair.builder().request(reqEntity).build()); 
        // ----------------------------------

        rep.setFinalPrice(finalPrice);
        rep.setDescription(description);
        rep.setCompletedAt(LocalDateTime.now());
        repairRepo.save(rep);

        // 동일 상태 멱등 처리
        if (req.getStatus() == RepairStatus.WAITING_FOR_PAYMENT) return;

        req.setStatus(RepairStatus.WAITING_FOR_PAYMENT);

        historyRepo.save(RepairHistory.builder()
                .requestId(requestId)
                .changedBy(engineer.getId())
                .previousStatus(prev)
                .newStatus(RepairStatus.WAITING_FOR_PAYMENT)
                .changedAt(LocalDateTime.now())
                .memo("최종 견적 입력: " + finalPrice + "원")
                .build());

        notificationEventHandler.onStatusChanged(req.getEngineerId(), req.getUserId(), RepairStatus.WAITING_FOR_PAYMENT);
    }

    /**
     * WAITING_FOR_DELIVERY -> COMPLETED
     * (테스트/특수상황 고려해 WAITING_FOR_PAYMENT에서도 허용 중)
     */
    @Override
    public void markShipped(Long requestId, String operatorLoginEmail, String trackingNo) {
        User operator = userRepo.findByEmail(operatorLoginEmail).orElseThrow();

        RepairRequest req = requestRepo.findById(requestId).orElseThrow();
        RepairStatus prev = req.getStatus();

        if (prev != RepairStatus.WAITING_FOR_DELIVERY && prev != RepairStatus.WAITING_FOR_PAYMENT) {
            throw new IllegalStateException("현재 상태에서 '발송 처리'를 할 수 없습니다: " + prev);
        }

        // 동일 상태 멱등 처리
        if (req.getStatus() == RepairStatus.COMPLETED) return;

        req.setStatus(RepairStatus.COMPLETED);

        historyRepo.save(RepairHistory.builder()
                .requestId(requestId)
                .changedBy(operator.getId())
                .previousStatus(prev)
                .newStatus(RepairStatus.COMPLETED)
                .changedAt(LocalDateTime.now())
                .memo(trackingNo != null ? "송장번호: " + trackingNo : "발송 처리")
                .build());

        notificationEventHandler.onStatusChanged(req.getEngineerId(), req.getUserId(), RepairStatus.COMPLETED);
    }
}
