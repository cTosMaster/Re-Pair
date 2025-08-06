// src/main/java/com/example/asplatform/admin/dto/UserUpdateRequest.java
package com.example.asplatform.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class UserUpdateRequest {
    @NotBlank private String name;
    @NotBlank private String phone;
    @NotBlank private String address;
    private String imageUrl;
    private boolean isActive = true;   // 필요 시 같이 수정
}
