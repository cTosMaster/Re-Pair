package com.example.asplatform.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO for updating Customer info including address fields.
 */
@Getter
@Setter
public class CustomerUpdateRequest {

    @NotBlank
    private String companyName;

    @NotBlank
    private String companyNumber;

    /** 우편번호 (5자리) */
    @NotBlank
    private String postalCode;

    /** 도로명주소 */
    @NotBlank
    private String roadAddress;

    /** 상세주소 (동·호 등) */
    private String detailAddress;

    /** 위도 (lat) */
    @NotNull
    private Double lat;

    /** 경도 (lng) */
    @NotNull
    private Double lng;

    @NotBlank
    private String contactName;

    @NotBlank
    private String contactEmail;

    @NotBlank
    private String contactPhone;

    @NotBlank
    private String openingHours;

    private String businessDocUrl;

    private boolean isTermsAgreed;

    private com.example.asplatform.common.enums.CustomerStatus status;
}
