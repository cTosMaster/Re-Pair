package com.example.asplatform.preset.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.example.asplatform.estimate.domain.Estimate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstimatePresetUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usage_id")
    private Long usageId;

    @ManyToOne
    @JoinColumn(name = "estimate_id", nullable = false)
    private Estimate estimate;

    @ManyToOne
    @JoinColumn(name = "preset_id", nullable = false)
    private Preset preset;

    @Column(name = "memo")
    private String memo;

    @Column(name = "used_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime usedAt;
}