package com.example.asplatform.user.dto.responseDTO;

import com.example.asplatform.common.enums.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/** GET /api/users/me, PATCH /api/users/me 응답 */
@Getter
@Builder
public class MyProfileResponse {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String imageUrl;
    private Role role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLogin;

    // 주소
    private String postalCode;
    private String roadAddress;
    private String detailAddress;
    private Double lat;   // 위도
    private Double lng;   // 경도
}
