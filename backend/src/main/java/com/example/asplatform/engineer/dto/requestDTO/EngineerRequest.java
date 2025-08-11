package com.example.asplatform.engineer.dto.requestDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class EngineerRequest {
    @NotNull private Long customerId;
    @NotBlank private String name;     // 표시용 이름
    @Email @NotBlank private String email;   // 로그인 ID
    @NotBlank private String password;
    @NotBlank private String phone;
}
