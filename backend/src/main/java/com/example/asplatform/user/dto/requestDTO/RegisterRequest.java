// src/main/java/com/example/asplatform/user/dto/requestDTO/RegisterRequest.java
package com.example.asplatform.user.dto.requestDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 8)
    private String password;

    @NotBlank @Size(min = 8)
    private String passwordConfirm;

    @NotBlank
    private String name;

    @NotBlank
    private String phone;

    @NotBlank
    private String address;

    private String imageUrl;    // 선택적

    @NotBlank
    private String role;        // USER, ENGINEER, CUSTOMER, ADMIN 중 하나
}
