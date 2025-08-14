package com.example.asplatform.estimate.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.asplatform.estimate.domain.Estimate;

public interface EstimateRepository extends JpaRepository<Estimate, Long> {

	boolean existsByRequestId(Long requestId);

	Optional<Estimate> findByRequestId(Long requestId); // 조회용
}
