package com.example.asplatform.engineer.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "engineers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Engineer {

    @Id
    @Column(name = "engineer_id")
    private Long id; // users.id 와 동일

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "is_assigned", nullable = false)
    private Boolean isAssigned;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;
}
