package com.example.asplatform.engineer.dto.requestDTO;

import lombok.Getter;
import lombok.NoArgsConstructor;

// 관리가자 수리기사 등록 , 일반 signup과 달라야함
@Getter
@NoArgsConstructor
public class EngineerSignupRequestDto {
    private String username; // 로그인용 아이디
    private String name;
    private String email;
    private String password;
    private String passwordCheck;
    private String phone;
    private Long customerId;
}
