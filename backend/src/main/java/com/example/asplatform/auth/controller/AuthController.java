// src/main/java/com/example/asplatform/auth/controller/AuthController.java
package com.example.asplatform.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.auth.dto.requestDTO.LoginRequest;
import com.example.asplatform.auth.dto.requestDTO.ResetPasswordRequest;
import com.example.asplatform.auth.dto.requestDTO.SendResetLinkRequest;
import com.example.asplatform.auth.dto.requestDTO.TokenRefreshRequest;
import com.example.asplatform.auth.dto.requestDTO.VerifyCodeRequest;
import com.example.asplatform.auth.dto.responseDTO.AccessTokenResponse;
import com.example.asplatform.auth.dto.responseDTO.LoginResponse;
import com.example.asplatform.auth.dto.responseDTO.MessageResponse;
import com.example.asplatform.auth.dto.responseDTO.TokenResponse;
import com.example.asplatform.auth.dto.responseDTO.VerifyCodeResponse;
import com.example.asplatform.auth.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/token")
    public ResponseEntity<AccessTokenResponse> token(@Valid @RequestBody TokenRefreshRequest req) {
        return ResponseEntity.ok(authService.token(req));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody TokenRefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req));
    }

    // 회원가입용 코드 검증
    @PostMapping("/verify-signup-code")
    public ResponseEntity<VerifyCodeResponse> verifySignupCode(
            @Valid @RequestBody VerifyCodeRequest req) {
        boolean ok = authService.verifySignupCode(req.getEmail(), req.getCode());
        return ResponseEntity.ok(new VerifyCodeResponse(ok));
    }

    // 비밀번호 재설정용 이메일 인증 코드 발송
    @PostMapping("/send-reset-code")
    public ResponseEntity<MessageResponse> sendResetCode(
            @Valid @RequestBody SendResetLinkRequest req) {
        return ResponseEntity.ok(authService.sendResetCode(req));
    }

    // 비밀번호 재설정용 코드 검증
    @PostMapping("/verify-reset-code")
    public ResponseEntity<VerifyCodeResponse> verifyResetCode(
            @Valid @RequestBody VerifyCodeRequest req) {
        boolean ok = authService.verifyResetCode(req.getEmail(), req.getCode());
        return ResponseEntity.ok(new VerifyCodeResponse(ok));
    }

    // 실제 비밀번호 재설정
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest req) {
        return ResponseEntity.ok(authService.resetPassword(req));
    }
}
