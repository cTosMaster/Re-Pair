// src/main/java/com/example/asplatform/customer/dto/requestDTO/CustomerRegistrationRequest.java
package com.example.asplatform.customer.dto.requestDTO;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class CustomerRegistrationRequest {
    /** 1) 약관 동의 */
    @AssertTrue(message = "약관에 동의해야 합니다.")
    private boolean termsAgreed;

    /** 2) 고객사 기본 정보 */
    @NotBlank(message = "회사명을 입력하세요.")
    private String companyName;

    @NotBlank(message = "사업자등록번호를 입력하세요.")
    private String companyNumber;

    @NotBlank(message = "담당자 이름을 입력하세요.")
    private String contactName;

    @Email(message = "유효한 이메일을 입력하세요.")
    @NotBlank(message = "담당자 이메일을 입력하세요.")
    private String contactEmail;

    @NotBlank(message = "담당자 전화번호를 입력하세요.")
    private String contactPhone;

    @NotBlank(message = "사업자등록증 URL을 입력하세요.")
    private String businessDocUrl;

    @NotBlank(message = "영업시간을 입력하세요.")
    private String openingHours;

    /** 3) 주소 정보 (다음 주소 API) */
    @NotBlank(message = "우편번호를 입력하세요.")
    private String postalCode;

    @NotBlank(message = "도로명주소를 입력하세요.")
    private String roadAddress;

    private String detailAddress;

    @NotNull(message = "위도(lat)를 입력하세요.")
    private Double lat;

    @NotNull(message = "경도(lng)를 입력하세요.")
    private Double lng;

    /** 4) 선택된 플랫폼 카테고리 ID 목록 */
    @NotEmpty(message = "하나 이상의 카테고리를 선택하세요.")
    private List<@NotNull Long> categoryIds;
}
