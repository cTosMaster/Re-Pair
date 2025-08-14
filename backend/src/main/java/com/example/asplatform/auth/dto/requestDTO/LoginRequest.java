// src/main/java/com/example/asplatform/auth/dto/requestDTO/LoginRequest.java
package com.example.asplatform.auth.dto.requestDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {
    @Email @NotBlank
    private String email;
    @NotBlank
    private String password;
}