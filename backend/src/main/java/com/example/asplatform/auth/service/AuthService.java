// src/main/java/com/example/asplatform/auth/service/AuthService.java
package com.example.asplatform.auth.service;

import com.example.asplatform.auth.dto.requestDTO.*;
import com.example.asplatform.auth.dto.responseDTO.LoginResponse;
import com.example.asplatform.auth.dto.responseDTO.TokenResponse;
import com.example.asplatform.auth.dto.responseDTO.AccessTokenResponse;
import com.example.asplatform.auth.dto.responseDTO.MessageResponse;
import com.example.asplatform.common.util.JwtUtil;
import com.example.asplatform.common.util.EmailUtil;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final EmailUtil emailUtil;
    private final PasswordEncoder passwordEncoder; // 비밀번호 암호화(BCrypt) 인코더

    /**
     * 로그인 처리
     * 1) 이메일로 사용자 조회
     * 2) 입력된 비밀번호가 저장된 해시와 일치하는지 검사
     * 3) 액세스 토큰과 리프레시 토큰 생성 후 응답
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        // 1) 사용자 조회
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        // 2) 비밀번호 검증
        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        // 3) JWT 토큰 생성
        String access = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refresh = jwtUtil.generateRefreshToken(user.getEmail());
        // 4) 응답 DTO 반환 (토큰 + 사용자 식별 정보)
        return new LoginResponse(access, refresh, user.getEmail(), user.getRole().name());
    }

    /**
     * 액세스 토큰 갱신 (리프레시 토큰만 받아 액세스 토큰 재발급)
     * 1) 리프레시 토큰 유효성 검사
     * 2) 토큰에 저장된 이메일에서 사용자 권한 조회하여 액세스 토큰 재발급
     */
    @Transactional(readOnly = true)
    public AccessTokenResponse token(TokenRefreshRequest req) {

        // 1) 리프레시 토큰 유효성 확인
        if (!jwtUtil.validateToken(req.getRefreshToken())) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
        // 2) 토큰에서 서브젝트(이메일) 추출
        String email = jwtUtil.getSubject(req.getRefreshToken());
        return new AccessTokenResponse(jwtUtil.generateAccessToken(email, userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found")).getRole().name()));
    }

    /**
     * 액세스 + 리프레시 토큰 모두 재발급
     * 1) 리프레시 토큰 유효성 검사
     * 2) 토큰에서 이메일 추출 후 사용자 정보 로드
     * 3) 새 액세스 토큰 및 새 리프레시 토큰 생성
     */
    @Transactional(readOnly = true)
    public TokenResponse refresh(TokenRefreshRequest req) {
        if (!jwtUtil.validateToken(req.getRefreshToken())) {
            throw new RuntimeException("Invalid or expired refresh token");
        }
        String email = jwtUtil.getSubject(req.getRefreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String access = jwtUtil.generateAccessToken(user.getEmail(), user.getRole().name());
        String refresh = jwtUtil.generateRefreshToken(user.getEmail());
        return new TokenResponse(access, refresh);
    }

    /**
     * 비밀번호 재설정용 인증 코드(토큰) 발송
     * 1) 이메일로 사용자 조회
     * 2) 5분 유효한 비밀번호 재설정 토큰 생성
     * 3) 이메일로 토큰(코드) 발송
     */
    public MessageResponse sendCode(SendResetLinkRequest req) {

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        //가진 짧은 만료 토큰 생성
        String token = jwtUtil.generatePasswordResetToken(user.getEmail());

        // 이메일 전송 (본문에 토큰 포함)
        emailUtil.sendEmail(user.getEmail(), "Verification Code", "Your code: " + token);
        return new MessageResponse("인증 코드가 발송되었습니다.");
    }

    /**
     * 인증 코드 검증
     * 1) 토큰 유효성 확인
     * 2) 목적(purpose) 클레임이 'PASSWORD_RESET'인지 확인
     * 3) 토큰 Subject(이메일)과 입력 이메일 일치 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean verifyCode(String email, String code) {
        // 1) 토큰 유효성 확인
        if (!jwtUtil.validateToken(code)) {
            return false;
        }
        // 2) 토큰 클레임 파싱 후 목적 확인
        var claims = jwtUtil.getAllClaims(code);
        if (!"PASSWORD_RESET".equals(claims.get("purpose", String.class))) {
            return false;
        }
        // 3) 토큰 Subject(이메일)과 입력 이메일 일치 여부
        return email.equals(claims.getSubject());
    }

    /**
     * 비밀번호 재설정 처리
     * 1) 새 비밀번호/확인 일치 여부 확인
     * 2) 인증 코드 검증
     * 3) DB에서 사용자 조회 후 패스워드 업데이트
     */
    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest req) {
        // 1) 비밀번호 확인 일치 체크
        if (!req.getNewPassword().equals(req.getNewPasswordConfirm())) {
            throw new IllegalArgumentException("새 비밀번호 확인이 일치하지 않습니다.");
        }
        // 2) 인증 코드 검증
        if (!verifyCode(req.getEmail(), req.getCode())) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 인증 코드입니다.");
        }
        // 3) 실제 비밀번호 업데이트
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return new MessageResponse("비밀번호가 변경되었습니다.");
    }
}