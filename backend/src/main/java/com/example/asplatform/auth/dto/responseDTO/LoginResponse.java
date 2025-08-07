// src/main/java/com/example/asplatform/auth/dto/responseDTO/LoginResponse.java
package com.example.asplatform.auth.dto.responseDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private String role;
}