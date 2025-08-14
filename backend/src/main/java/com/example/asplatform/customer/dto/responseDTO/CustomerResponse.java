package com.example.asplatform.customer.dto.responseDTO;
import com.example.asplatform.customer.domain.Customer;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CustomerResponse {
    private Long id;
    private String companyName;
    private String companyNumber;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String businessDocUrl;
    private String openingHours;
    private boolean isTermsAgreed;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;

    private CustomerAddressResponse address;

    public static CustomerResponse from(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .companyName(customer.getCompanyName())
                .companyNumber(customer.getCompanyNumber())
                .contactName(customer.getContactName())
                .contactEmail(customer.getContactEmail())
                .contactPhone(customer.getContactPhone())
                .businessDocUrl(customer.getBusinessDocUrl())
                .openingHours(customer.getOpeningHours())
                .isTermsAgreed(customer.isTermsAgreed())
                .status(customer.getStatus().name())
                .createdAt(customer.getCreatedAt())
                .approvedAt(customer.getApprovedAt())
                .address(customer.getAddress() != null ? CustomerAddressResponse.from(customer.getAddress()) : null)
                .build();
    }
}
