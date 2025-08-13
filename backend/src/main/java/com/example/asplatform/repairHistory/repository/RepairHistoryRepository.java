package com.example.asplatform.repairHistory.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairRequest.domain.RepairRequest;

@Repository
public interface RepairHistoryRepository extends JpaRepository<RepairHistory, Long> {

    /**
     * 특정 수리 요청(repairRequestId)에 대한 상태 변경 이력을
     * 변경일시(changedAt) 기준으로 내림차순 정렬하여 조회
     * => 가장 최신 상태 이력이 먼저 나오도록 정렬됨
     */
	List<RepairHistory> findByRepairRequestOrderByChangedAtAsc(RepairRequest request);
}