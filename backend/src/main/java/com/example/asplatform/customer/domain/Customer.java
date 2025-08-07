package com.example.asplatform.customer.domain;

import com.example.asplatform.common.enums.CustomerStatus;
import com.example.asplatform.repair.domain.RepairableItem;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "company_number", nullable = false, unique = true)
    private String companyNumber; // 사업자등록번호

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
    private CustomerStatus status;

    @Column(name = "created_at", updatable = false,
            columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    /**
     * 1:1 매핑된 고객사 주소 엔티티
     */
    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private CustomerAddress address;

    /**
     * 너가 추가한: 고객이 등록한 수리 가능 항목들
     */
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<RepairableItem> repairableItems = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
