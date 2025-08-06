// src/main/java/com/example/asplatform/admin/dto/UserDto.java
package com.example.asplatform.admin.dto;

import com.example.asplatform.common.enums.Role;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String phone;
    private String address;
    private String imageUrl;
    private Role role;
    private boolean isActive;
    private String createdAt;
}
