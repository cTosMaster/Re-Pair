package com.example.asplatform.engineer.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "engineers")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Engineer {

    /** users.id 를 그대로 PK로 사용 */
    @Id
    @Column(name = "engineer_id")
    private Long userId;

    /** customers.customer_id */
    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "is_assigned", nullable = false)
    private boolean assigned = false;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    /** 생성 편의용 생성자 */
    public Engineer(Long userId, Long customerId) {
        this.userId = userId;
        this.customerId = customerId;
    }

    /** 배정 상태 토글 메서드 */
    public void setAssigned(boolean assigned) {
        this.assigned = assigned;
        this.assignedAt = assigned
                ? LocalDateTime.now()
                : null;
    }
}
