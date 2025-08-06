// src/main/java/com/example/asplatform/admin/dto/CustomerUpdateRequest.java
package com.example.asplatform.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class CustomerUpdateRequest {
    @NotBlank private String companyName;
    @NotBlank private String companyNumber;
    @NotBlank private String address;
    @NotBlank private String contactName;
    @NotBlank private String contactEmail;
    @NotBlank private String contactPhone;
    @NotBlank private String openingHours;
    private String businessDocUrl;  // 선택
}
