package com.example.asplatform.repairHistory.domain;

import java.time.LocalDateTime;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.user.domain.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "repair_history")
@Getter
@NoArgsConstructor
public class RepairHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    // 변경 대상 수리 요청 연관 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private RepairRequest repairRequest;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", nullable = false, length = 50)
    private RepairStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 50)
    private RepairStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", nullable = false)
    private User changedBy; // User 엔티티와 연관관계
    
    @Column(name = "memo", nullable = false, length = 255)
    private String memo;
    
    @Column(name = "changed_at", nullable = false)
    private LocalDateTime changedAt;

    @PrePersist
    public void onCreate() {
        this.changedAt = LocalDateTime.now();
    }
    
    @Builder
    public RepairHistory(RepairRequest repairRequest,
                         RepairStatus previousStatus,
                         RepairStatus newStatus,
                         User changedBy,
                         String memo) {
        this.repairRequest = repairRequest;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.memo = memo;
        this.changedAt = LocalDateTime.now();
    }
    
    

}