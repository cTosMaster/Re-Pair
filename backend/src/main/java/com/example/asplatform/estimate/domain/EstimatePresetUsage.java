package com.example.asplatform.estimate.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "estimate_preset_usage")
@Setter
@Getter
public class EstimatePresetUsage {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long usageId;

	@Column(name = "estimate_id", nullable = false)
	private Long estimateId;

	@Column(name = "preset_id", nullable = false)
	private Long presetId;

	// 필요하면 메모만 유지
	private String memo;

	private LocalDateTime usedAt;

	@PrePersist
	void prePersist() {
		usedAt = LocalDateTime.now();
	}
}