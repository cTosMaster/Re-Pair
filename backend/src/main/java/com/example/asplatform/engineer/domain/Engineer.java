package com.example.asplatform.engineer.domain;

import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "engineers")
@Getter @NoArgsConstructor @AllArgsConstructor
@Builder
public class Engineer {
    // User ID를 Engineer ID로 사용하기 위해 @Id
    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // 외래키를 기본키로 설정할 때 사용 -> UserId를 EngineerId로 사용
    @Column(name="engineer_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="customer_id",nullable = false)
    private Customer customer;

    @Column(name = "is_assigned")
    private Boolean isAssigned = false;

    @Column(name="assigned_at")
    private LocalDateTime assignedAt;

}