// src/main/java/com/example/asplatform/common/util/JwtUtil.java
package com.example.asplatform.common.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key secretKey;          // 서명에 사용할 비밀 키
    private final long accessExpireMs;    // 액세스 토큰 만료시간
    private final long refreshExpireMs;   // 리프레시 토큰 만료시간 (밀리초)

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expire-ms}") long accessExpireMs,
            @Value("${jwt.refresh-expire-ms}") long refreshExpireMs
    ) {
        this.secretKey      = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpireMs = accessExpireMs;
        this.refreshExpireMs= refreshExpireMs;
    }

    /**
     * 액세스 토큰 생성
     */
    public String generateAccessToken(String subject, String role) {
        return Jwts.builder()
                .setSubject(subject)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessExpireMs))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 리프레시 토큰 생성
     */
    public String generateRefreshToken(String subject) {
        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshExpireMs))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 목적(purpose) 클레임을 담아 토큰 생성
     * - "EMAIL_VERIFICATION" 용: 회원가입 이메일 인증 (10분)
     * - "PASSWORD_RESET"    용: 비밀번호 재설정 (5분)
     */
    public String generateTokenWithPurpose(String subject, String purpose) {
        long now = System.currentTimeMillis();
        long expireMs;
        switch (purpose) {
            case "PASSWORD_RESET":
                expireMs = 5 * 60_000L;   // 5분
                break;
            case "EMAIL_VERIFICATION":
            default:
                expireMs = 10 * 60_000L;  // 10분
                break;
        }
        return Jwts.builder()
                .setSubject(subject)
                .claim("purpose", purpose)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expireMs))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * JWT 유효성 검사
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    /**
     * 토큰 서브젝트(Subject) 추출
     */
    public String getSubject(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * 모든 클레임 반환
     */
    public Claims getAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
