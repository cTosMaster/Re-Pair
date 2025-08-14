// src/main/java/com/example/asplatform/auth/dto/requestDTO/SendResetLinkRequest.java
package com.example.asplatform.auth.dto.requestDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendResetLinkRequest {
    @Email @NotBlank
    private String email;
}