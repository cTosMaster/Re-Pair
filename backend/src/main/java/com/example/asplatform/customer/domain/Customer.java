package com.example.asplatform.customer.domain;

import java.time.LocalDateTime;

import com.example.asplatform.common.enums.CustomerStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customers")
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "business_number", nullable = false, unique = true)
    private String businessNumber;

    @Column(nullable = false)
    private String address;

    @Column(name = "contact_name", nullable = false)
    private String contactName;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    @Column(name = "contact_phone", nullable = false)
    private String contactPhone;

    @Column(name = "business_doc_url", nullable = false)
    private String businessDocUrl;

    @Column(name = "opening_hours", nullable = false)
    private String openingHours;

    @Column(name = "is_terms_agreed", nullable = false)
    private Boolean isTermsAgreed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = CustomerStatus.PENDING; //기본값
        }
        if (this.isTermsAgreed == null) {
            this.isTermsAgreed = false;
        }
    }
}