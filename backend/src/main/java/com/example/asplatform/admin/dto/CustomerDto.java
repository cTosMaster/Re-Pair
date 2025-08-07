package com.example.asplatform.admin.dto;

import com.example.asplatform.common.enums.CustomerStatus;
import lombok.Data;

@Data
public class CustomerDto {
    private Long id;
    private String companyName;
    private String companyNumber;

    /** 우편번호 (5자리) */
    private String postalCode;

    /** 도로명주소 */
    private String roadAddress;

    /** 상세주소 (동·호 등) */
    private String detailAddress;

    /** 위도 (lat) */
    private Double lat;

    /** 경도 (lng) */
    private Double lng;

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
