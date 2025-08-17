package com.example.asplatform.estimate.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.user.domain.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "estimates", uniqueConstraints = @UniqueConstraint(name = "uq_estimates_request", columnNames = "request_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Estimate {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "estimate_id")
	private Long estimateId;

	// 스칼라 FK
	@Column(nullable = false)
	private Long requestId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "engineer_id", nullable = false)
	private User engineer;

	@Column
	private Integer presetTotal;

	@Column
	private Integer manualAmount;

	@Column(name = "price", nullable = false)
	private Integer price;

	@Column(name = "description", nullable = false)
	private String description;

	@Column(name = "created_at", nullable = false, updatable = false)
	@CreationTimestamp
	private LocalDateTime createdAt;

}