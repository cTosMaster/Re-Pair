// src/main/java/com/example/asplatform/auth/dto/requestDTO/NewPasswordRequest.java
package com.example.asplatform.auth.dto.requestDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NewPasswordRequest {
    @NotBlank
    @Size(min = 8)
    private String newPassword;
}