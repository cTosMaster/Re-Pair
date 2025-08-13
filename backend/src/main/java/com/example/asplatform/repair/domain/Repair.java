package com.example.asplatform.repair.domain;

import java.time.LocalDateTime;

import com.example.asplatform.repairRequest.domain.RepairRequest;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "repairs")
@Getter
@NoArgsConstructor
public class Repair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "repair_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private RepairRequest request;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "final_price", nullable = false)
    private int finalPrice;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    public Repair(RepairRequest request) {
        this.request = request;
    }

    public void setDescription(String description) { this.description = description; }
    public void setFinalPrice(int finalPrice) { this.finalPrice = finalPrice; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
