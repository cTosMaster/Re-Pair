// src/main/java/com/example/asplatform/auth/dto/responseDTO/TokenResponse.java
package com.example.asplatform.auth.dto.responseDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenResponse {
    private String accessToken;
    private String refreshToken;
}