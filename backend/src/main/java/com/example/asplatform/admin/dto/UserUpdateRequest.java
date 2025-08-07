// src/main/java/com/example/asplatform/admin/dto/UserUpdateRequest.java
package com.example.asplatform.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {
    @NotBlank private String name;
    @NotBlank private String phone;

    /** 우편번호 (5자리) */
    @NotBlank private String postalCode;

    /** 도로명주소 */
    @NotBlank private String roadAddress;

    /** 상세주소 (동·호 등) */
    private String detailAddress;

    /** 위도 (lat) */
    @NotNull private Double lat;

    /** 경도 (lng) */
    @NotNull private Double lng;

    private String imageUrl;
    private boolean isActive = true;
}
