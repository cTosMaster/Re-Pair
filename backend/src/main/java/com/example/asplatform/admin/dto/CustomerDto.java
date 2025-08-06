// src/main/java/com/example/asplatform/admin/dto/CustomerDto.java
package com.example.asplatform.admin.dto;

import com.example.asplatform.common.enums.CustomerStatus;
import lombok.Data;

@Data
public class CustomerDto {
    private Long id;
    private String companyName;
    private String companyNumber;
    private String address;
    private String contactName;
    private String contactEmail;
    private String contactPhone;
    private String businessDocUrl;
    private String openingHours;
    private boolean isTermsAgreed;
    private CustomerStatus status;
    private String createdAt;
    private String approvedAt;
}
