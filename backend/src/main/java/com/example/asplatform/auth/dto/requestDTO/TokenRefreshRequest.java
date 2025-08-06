// src/main/java/com/example/asplatform/auth/dto/requestDTO/TokenRefreshRequest.java
package com.example.asplatform.auth.dto.requestDTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenRefreshRequest {
    @NotBlank
    private String refreshToken;
}