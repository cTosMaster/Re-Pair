// src/main/java/com/example/asplatform/customer/domain/Customer.java
package com.example.asplatform.customer.domain;

import com.example.asplatform.common.enums.CustomerStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customers")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor @Builder
public class Customer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "company_number", nullable = false)
    private String companyNumber; // 사업자등록번호

    @Column(name = "address", nullable = false, length = 500)
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
    private boolean isTermsAgreed;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CustomerStatus status;          // PENDING / APPROVED / REJECTED

    @Column(name = "created_at", updatable = false,
            columnDefinition = "DATETIME default CURRENT_TIMESTAMP")
    private java.time.LocalDateTime createdAt;

    @Column(name = "approved_at")
    private java.time.LocalDateTime approvedAt;
}
