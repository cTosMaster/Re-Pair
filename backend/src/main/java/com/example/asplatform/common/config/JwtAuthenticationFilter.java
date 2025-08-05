package com.example.asplatform.common.config;

import com.example.asplatform.common.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    /**
     * 모든 요청마다 한 번씩 실행되는 필터 메서드
     */
    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain)
            throws ServletException, IOException {

        // Authorization 헤더에서 토큰 추출
        String header = req.getHeader(HttpHeaders.AUTHORIZATION);

        // 헤더가 존재하고 "Bearer "로 시작하면
        if (header != null && header.startsWith("Bearer ")) {
            // "Bearer " 접두사 제거 후 순수 토큰 값만 취득
            String token = header.substring(7);

            // 토큰 유효성 검사 (서명·만료 검증)
            if (jwtUtil.validateToken(token)) {

                // 토큰에서 subject(이메일) 추출
                String username = jwtUtil.getSubject(token);
                // DB에서 사용자 정보 조회 (UserDetails)
                UserDetails user = userDetailsService.loadUserByUsername(username);

                // 인증 객체 생성 (Spring Security 인증 정보)
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));

                // SecurityContext에 인증 정보 저장
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        //다음 필터 체인으로 요청 전달
        chain.doFilter(req, res);
    }
}
