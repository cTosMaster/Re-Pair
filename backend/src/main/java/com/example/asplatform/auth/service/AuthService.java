// src/main/java/com/example/asplatform/auth/service/AuthService.java
package com.example.asplatform.auth.service;

import com.example.asplatform.auth.dto.requestDTO.LoginRequest;
import com.example.asplatform.auth.dto.requestDTO.ResetPasswordRequest;
import com.example.asplatform.auth.dto.requestDTO.SendResetLinkRequest;
import com.example.asplatform.auth.dto.requestDTO.TokenRefreshRequest;
import com.example.asplatform.auth.dto.responseDTO.AccessTokenResponse;
import com.example.asplatform.auth.dto.responseDTO.LoginResponse;
import com.example.asplatform.auth.dto.responseDTO.MessageResponse;
import com.example.asplatform.auth.dto.responseDTO.TokenResponse;
import com.example.asplatform.common.util.EmailUtil;
import com.example.asplatform.common.util.JwtUtil;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final EmailUtil emailUtil;
    private final PasswordEncoder passwordEncoder; // 비밀번호 암호화(BCrypt) 인코더

    // 계정 비활성화 여부 체크
    private void ensureActive(User user) {
        if (Boolean.FALSE.equals(user.getIsActive())) {
            throw new RuntimeException("비활성화된 계정입니다. 관리자에게 문의하세요.");
        }
    }

    /**
     * 로그인 처리
     * 1) 이메일로 사용자 조회
     * 2) 입력된 비밀번호 검증
     * 3) 액세스 토큰 + 리프레시 토큰 생성 후 반환
     */
    @Transactional
    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // ✅ 비활성 계정 차단
        ensureActive(user);

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        user.setLastLogin(java.time.LocalDateTime.now());

        String access  = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refresh = jwtUtil.generateRefreshToken(user.getEmail());
        return new LoginResponse(access, refresh, user.getEmail(), user.getRole().name());
    }

    /**
     * 액세스 토큰 갱신 (리프레시 토큰만 받아 재발급)
     */
    @Transactional(readOnly = true)
    public AccessTokenResponse token(TokenRefreshRequest req) {
        if (!jwtUtil.validateToken(req.getRefreshToken())) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        String email = jwtUtil.getSubject(req.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ 비활성 계정 차단
        ensureActive(user);

        String newAccess = jwtUtil.generateAccessToken(email, user.getRole().name());
        return new AccessTokenResponse(newAccess);
    }

    /**
     * 액세스 + 리프레시 토큰 모두 재발급
     */
    @Transactional(readOnly = true)
    public TokenResponse refresh(TokenRefreshRequest req) {
        if (!jwtUtil.validateToken(req.getRefreshToken())) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
        String email = jwtUtil.getSubject(req.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ 비활성 계정 차단
        ensureActive(user);

        String newAccess  = jwtUtil.generateAccessToken(email, user.getRole().name());
        String newRefresh = jwtUtil.generateRefreshToken(email);
        return new TokenResponse(newAccess, newRefresh);
    }

    /**
     * 회원가입용 이메일 인증 코드 발송
     * - DB에 없으면 토큰 생성 → 전송
     */
    public MessageResponse sendSignupCode(SendResetLinkRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }
        String token = jwtUtil.generateTokenWithPurpose(req.getEmail(), "EMAIL_VERIFICATION");
        emailUtil.sendEmail(req.getEmail(),
                "회원가입 이메일 인증 코드",
                "Your code: " + token);
        return new MessageResponse("회원가입용 인증 코드가 발송되었습니다.");
    }

    /**
     * 비밀번호 재설정용 인증 코드 발송
     * - DB에 있으면 토큰 생성 → 전송
     */
    public MessageResponse sendResetCode(SendResetLinkRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtUtil.generateTokenWithPurpose(user.getEmail(), "PASSWORD_RESET");
        emailUtil.sendEmail(user.getEmail(),
                "비밀번호 재설정 인증 코드",
                "Your code: " + token);
        return new MessageResponse("비밀번호 재설정용 인증 코드가 발송되었습니다.");
    }

    /**
     * 회원가입용 코드 검증
     */
    @Transactional(readOnly = true)
    public boolean verifySignupCode(String email, String code) {
        if (!jwtUtil.validateToken(code)) {
            return false;
        }
        var claims = jwtUtil.getAllClaims(code);
        if (!"EMAIL_VERIFICATION".equals(claims.get("purpose", String.class))) {
            return false;
        }
        return email.equals(claims.getSubject());
    }

    /**
     * 비밀번호 재설정용 코드 검증
     */
    @Transactional(readOnly = true)
    public boolean verifyResetCode(String email, String code) {
        if (!jwtUtil.validateToken(code)) {
            return false;
        }
        var claims = jwtUtil.getAllClaims(code);
        if (!"PASSWORD_RESET".equals(claims.get("purpose", String.class))) {
            return false;
        }
        return email.equals(claims.getSubject());
    }

    /**
     * 비밀번호 재설정 처리
     * 1) 새 비밀번호 확인 일치
     * 2) 인증 코드 검증
     * 3) 비밀번호 업데이트
     */
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest req) {
        if (!req.getNewPassword().equals(req.getNewPasswordConfirm())) {
            throw new IllegalArgumentException("새 비밀번호 확인이 일치하지 않습니다.");
        }
        if (!verifyResetCode(req.getEmail(), req.getCode())) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 인증 코드입니다.");
        }
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        return new MessageResponse("비밀번호가 변경되었습니다.");
    }
}
