// src/main/java/com/example/asplatform/user/dto/requestDTO/RegisterRequest.java
package com.example.asplatform.user.dto.requestDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank(message = "인증 코드를 입력해주세요.")
    private String code;

    @NotBlank
    @Size(min = 8)
    private String password;

    @NotBlank
    @Size(min = 8)
    private String passwordConfirm;

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    /** 우편번호 (5자리) */
    @NotBlank
    private String postalCode;

    /** 도로명주소 */
    @NotBlank
    private String roadAddress;

    /** 상세주소 (동·호 등, 사용자가 직접 입력) */
    private String detailAddress;

    /** 선택적: 프로필 이미지 URL */
    private String imageUrl;

    /** 위도 (lat) */
    @NotNull
    private Double lat;

    /** 경도 (lng) */
    @NotNull
    private Double lng;

    @NotBlank
    private String role; // USER, ENGINEER, CUSTOMER, ADMIN 중 하나
}
