package com.example.asplatform.engineer.domain;

import com.example.asplatform.customer.domain.Customer;
import com.example.asplatform.user.domain.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "engineers")
public class Engineer {

    @Id
    @Column(name = "engineer_id")
    private Long id; // users.id

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "engineer_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "is_assigned", nullable = false)
    private boolean isAssigned = false;

    @Column(name = "assigned_at")
    private java.time.LocalDateTime assignedAt;
}
