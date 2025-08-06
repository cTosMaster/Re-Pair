package com.example.asplatform.customer.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.asplatform.repair.domain.RepairableItem;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    private String companyName;
    private String companyNumber;
    private String address;

    private String contactName;
    private String contactEmail;
    private String contactPhone;

    private String businessDocUrl;
    private String openingHours;

    private boolean isTermsAgreed;

    @Enumerated(EnumType.STRING)
    private CustomerStatus status; // PENDING, APPROVED, REJECTED

    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<RepairableItem> repairableItems = new ArrayList<>();
}
