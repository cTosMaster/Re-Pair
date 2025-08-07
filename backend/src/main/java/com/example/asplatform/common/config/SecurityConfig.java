
package com.example.asplatform.common.config;

import static org.springframework.security.config.Customizer.withDefaults;

import lombok.RequiredArgsConstructor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CORS는 기본 설정으로, CSRF는 disable()
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())

                // 세션 사용 안함: JWT 만으로 인증 처리
                .sessionManagement(sm -> sm
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                // 엔드포인트별 권한 설정
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()


					//인증·회원가입 API 열어두기
					.requestMatchers(
					        "/api/auth/**",
					        "/api/users/send-signup-code",
					        "/api/users/register",
					        "/api/payments/callback",
					        "/api/payments/request"
					).permitAll()
					
					// 인증 처리가 필요한 API ( CUSTOMER 권한을 가진 사용자만 결제 부분에 접근 가능 ) 
					.requestMatchers(
					        "/api/payments/status/**",
					        "/api/payments",
					        "/api/payments/pending",
					        "/api/payments/detail/**"
					).hasRole("CUSTOMER")
                        // Swagger UI 문서 열어두기
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                )
                // 사용자 인증(로그인) 처리 (아이디/비밀번호 검증 담당)
                .authenticationProvider(authenticationProvider)

                //기본 폼 로그인 필터가 실행되기전 JWT를 먼저 검사
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

}
