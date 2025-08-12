package com.example.asplatform.repair.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "repairs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Repair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "repair_id")
    private Long id;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Column(name = "description")
    private String description;

    @Column(name = "final_price", nullable = false)
    private Integer finalPrice;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;   // DB default NOW()

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;   // DB ON UPDATE CURRENT_TIMESTAMP
}
