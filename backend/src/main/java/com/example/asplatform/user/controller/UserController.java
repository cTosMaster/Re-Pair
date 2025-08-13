// src/main/java/com/example/asplatform/user/controller/UserController.java
package com.example.asplatform.user.controller;

import com.example.asplatform.auth.dto.requestDTO.SendResetLinkRequest;
import com.example.asplatform.auth.dto.responseDTO.MessageResponse;
import com.example.asplatform.auth.service.AuthService;
import com.example.asplatform.user.dto.requestDTO.RegisterRequest;
import com.example.asplatform.user.dto.requestDTO.UpdateMyProfileRequest;
import com.example.asplatform.user.dto.responseDTO.MyProfileResponse;
import com.example.asplatform.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    /** 회원가입용 이메일 인증 코드 발송 */
    @PostMapping("/send-signup-code")
    public ResponseEntity<MessageResponse> sendSignupCode(
            @Valid @RequestBody SendResetLinkRequest req
    ) {
        return ResponseEntity.ok(authService.sendSignupCode(req));
    }

    /** 회원가입 */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(
            @Valid @RequestBody RegisterRequest req
    ) {

        // 1) 이메일+코드 검증 (회원가입용 코드)
        if (!authService.verifySignupCode(req.getEmail(), req.getCode())) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 인증 코드입니다.");
        }

        // 2) 검증 통과 시 실제 회원가입 로직
        userService.register(req);
        return ResponseEntity.ok(new MessageResponse("회원가입이 완료되었습니다."));
    }

    /* ===================== 마이페이지 ===================== */

    /** 내 정보 조회 */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<MyProfileResponse> getMe() {
        return ResponseEntity.ok(userService.getMyProfile());
    }

    /** 내 정보 수정 (부분 업데이트) */
    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/me")
    public ResponseEntity<MyProfileResponse> updateMe(
            @Valid @RequestBody UpdateMyProfileRequest req
    ) {
        return ResponseEntity.ok(userService.updateMyProfile(req));
    }

    /** 회원 탈퇴(소프트 비활성화) */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/me/deactivate")
    public ResponseEntity<MessageResponse> deactivateMe() {
        userService.deactivateMyAccount();
        return ResponseEntity.ok(new MessageResponse("계정이 비활성화되었습니다."));
    }
}
