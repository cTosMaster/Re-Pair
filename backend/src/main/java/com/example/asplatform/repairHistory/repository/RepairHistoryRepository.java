package com.example.asplatform.repairHistory.repository;

import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RepairHistoryRepository extends JpaRepository<RepairHistory, Long> {

    // (기존 호환) requestId 로 조회
    List<RepairHistory> findByRequestIdOrderByChangedAtDesc(Long requestId);

    // (backend-dev 호환) 연관 엔티티로 조회
    List<RepairHistory> findByRepairRequestOrderByChangedAtDesc(RepairRequest request);
}
