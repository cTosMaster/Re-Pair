package com.example.asplatform.repairRequest.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.asplatform.repairRequest.domain.RepairRequest;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, Long> {
	
}
