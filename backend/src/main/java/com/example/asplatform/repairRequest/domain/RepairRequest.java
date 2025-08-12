// src/main/java/com/example/asplatform/repairrequest/domain/RepairRequest.java
package com.example.asplatform.repairRequest.domain;

import com.example.asplatform.common.enums.RepairStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "repair_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class RepairRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;        // 고객(users.id)

    @Column(name = "engineer_id")
    private Long engineerId;    // 배정 엔지니어(users.id)

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private RepairStatus status;
}
