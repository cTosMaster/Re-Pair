// src/main/java/com/example/asplatform/auth/dto/responseDTO/LoginResponse.java
package com.example.asplatform.auth.dto.responseDTO;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // null 필드는 JSON에서 제외
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private String role;
    private Long customerId; // null 값 가능

}