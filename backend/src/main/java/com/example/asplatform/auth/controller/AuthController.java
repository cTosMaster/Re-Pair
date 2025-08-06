// src/main/java/com/example/asplatform/auth/controller/AuthController.java
package com.example.asplatform.auth.controller;

import com.example.asplatform.auth.dto.requestDTO.*;
import com.example.asplatform.auth.dto.responseDTO.*;
import com.example.asplatform.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/send-code")
    public ResponseEntity<MessageResponse> sendCode(@Valid @RequestBody SendResetLinkRequest req) {
        return ResponseEntity.ok(authService.sendCode(req));
    }

    // AuthController.java 에 추가
    @PostMapping("/verify-code")
    public ResponseEntity<VerifyCodeResponse> verifyCode(
            @Valid @RequestBody VerifyCodeRequest req) {
        boolean ok = authService.verifyCode(req.getEmail(), req.getCode());
        return ResponseEntity.ok(new VerifyCodeResponse(ok));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest req) {
        MessageResponse resp = authService.resetPassword(req);
        return ResponseEntity.ok(resp);
    }
}
