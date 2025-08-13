package com.example.asplatform.repairRequest.domain;

import java.time.LocalDateTime;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.item.domain.RepairableItem;
import com.example.asplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "repair_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class RepairRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    /** --- ID 기반 컬럼 (서비스/알림에서 사용) --- */
    @Column(name = "user_id", nullable = false)
    private Long userId;               // 요청 고객 users.id

    @Column(name = "item_id", nullable = false)
    private Long itemId;               // 대상 제품 id

    @Column(name = "engineer_id")
    private Long engineerId;           // 배정 엔지니어 users.id (nullable)

    /** --- 읽기 전용 연관 (조회 편의용) --- */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", insertable = false, updatable = false)
    private RepairableItem repairableItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "engineer_id", insertable = false, updatable = false)
    private User engineer;

    /** --- 기타 컬럼 --- */
    @Column(length = 255)
    private String title;

    @Lob
    private String description;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private RepairStatus status;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = RepairStatus.PENDING;
    }
}
