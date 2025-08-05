package com.example.asplatform.common.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key secretKey; // 서명에 사용할 비밀 키
    private final long accessExpireMs;  // 액세스 토큰 만료시간
    private final long refreshExpireMs; // 리프레시 토큰 만료시간 (밀리초)

    public JwtUtil( //프로퍼티에서 설정된 JWT 시크릿과 만료시간을 주입받아 초기화
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expire-ms}") long accessExpireMs,
            @Value("${jwt.refresh-expire-ms}") long refreshExpireMs
    ) {
        // 비밀 키를 HMAC SHA256용 Key 객체로 변환
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessExpireMs = accessExpireMs;
        this.refreshExpireMs = refreshExpireMs;
    }

    /**
     * 액세스 토큰 생성
     * @param subject — 토큰의 subject 클레임(주로 사용자 식별자, 이메일)
     * @param role    — role 클레임에 담을 사용자 권한 문자열
     * @return 서명된 JWT 액세스 토큰 문자열
     */
    public String generateAccessToken(String subject, String role) {
        return Jwts.builder()
                .setSubject(subject)  // sub 클레임에 subject(이메일) 저장
                .claim("role", role)  // role 커스텀 클레임 추가
                .setIssuedAt(new Date())   // iat 클레임
                .setExpiration(new Date(System.currentTimeMillis() + accessExpireMs))  // exp 클레임
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact(); //헤더·페이로드·서명을 합쳐 JWT 문자열로 직렬화
    }

    /**
     * 리프레시 토큰 생성
     * @param subject — 토큰의 subject 클레임(사용자 식별자)
     * @return 서명된 JWT 리프레시 토큰 문자열
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
     * JWT 유효성 검사
     * @param token — 검증할 토큰
     * @return 유효하면 true, 서명 불일치 또는 만료 등 예외 발생 시 false
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token); // 토큰 파싱 및 검증 수행
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    public String getSubject(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * 토큰의 모든 클레임(Claims) 객체 반환
     * @param token — 분석할 JWT
     * @return Claims 객체(모든 클레임 포함)
     */
    public Claims getAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody(); //검증된 페이로드(Claims) 반환
    }

    /**
     * 5분 동안 유효하며, "purpose" 클레임에 PASSWORD_RESET을 담은 리셋 토큰 생성
     */
    public String generatePasswordResetToken(String email) {
        long resetExpireMs = 5 * 60_000L; // 5분
        return Jwts.builder()
                .setSubject(email)  // sub 클레임에 이메일 저장
                .claim("purpose", "PASSWORD_RESET")  // purpose 커스텀 클레임 추가
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + resetExpireMs))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }
}
