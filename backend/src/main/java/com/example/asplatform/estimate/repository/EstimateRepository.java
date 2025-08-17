package com.example.asplatform.estimate.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.asplatform.estimate.domain.Estimate;
import com.example.asplatform.repairRequest.domain.RepairRequest;

public interface EstimateRepository extends JpaRepository<Estimate, Long> {

	boolean existsByRequestId(Long requestId);

	Optional<Estimate> findByRequestId(Long requestId); // 조회용
	
	
}
