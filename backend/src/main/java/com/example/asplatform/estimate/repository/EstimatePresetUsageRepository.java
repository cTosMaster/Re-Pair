package com.example.asplatform.estimate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.asplatform.estimate.domain.EstimatePresetUsage;

public interface EstimatePresetUsageRepository extends JpaRepository<EstimatePresetUsage, Long> {

	List<EstimatePresetUsage> findByEstimateId(Long estimateId);
}
