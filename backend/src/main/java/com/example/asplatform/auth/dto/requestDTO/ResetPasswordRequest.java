// src/main/java/com/example/asplatform/auth/dto/requestDTO/ResetPasswordRequest.java
package com.example.asplatform.auth.dto.requestDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {
    @Email @NotBlank
    private String email;

    @NotBlank
    private String code;

    @NotBlank @Size(min = 4)
    private String newPassword;

    @NotBlank @Size(min = 4)
    private String newPasswordConfirm;
}
