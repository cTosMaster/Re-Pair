package com.example.asplatform.admin.dto;

import com.example.asplatform.common.enums.Role;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String phone;

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

    private String imageUrl;
    private Role role;
    private boolean isActive;
    private String createdAt;
}
