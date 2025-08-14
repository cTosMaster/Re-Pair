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
						.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				// 엔드포인트별 권한 설정
				.authorizeHttpRequests(auth -> auth

						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						// 인증·회원가입 API 열어두기
						.requestMatchers(
								"/api/auth/**",
								"/api/users/send-signup-code",
								"/api/users/register",
								"/api/payments/callback",
								"/api/payments/request"

						).permitAll()

						// get 요청 CUSTOMER , ENGINEER , ADMIN 모두 허용 (프리셋)
						/**
						 * - 프리셋 전체 조회
						 * - 카테고리, 제품별 프리셋 필터 조회
						 */

						.requestMatchers(HttpMethod.GET, "/api/presets/**")
						.hasAnyRole("ADMIN", "CUSTOMER", "ENGINEER")

						// 금액 계산, 단일 프리셋 미리보기
						.requestMatchers(HttpMethod.POST, "/api/presets/calculate", "/api/presets/{presetId}")
						.hasAnyRole("ADMIN", "CUSTOMER", "ENGINEER")

						// 파일 업로드 api
						.requestMatchers("/api/files/initiate", "/api/files/complete").permitAll()
						// (추가) 플랫폼 관리자, 고객사 관리자 둘다 플랫폼 카테고리 조회가능해야 함.
						.requestMatchers("/api/admin/platform-categories").hasAnyRole("ADMIN", "CUSTOMER")
						// 상대방 쪽에서 있던 관리자 대시보드 ADMIN 접근 제한 유지
						.requestMatchers("/api/admin/**").hasRole("ADMIN")

						// 등록, 수정, 삭제는 CUSTOMER만 (자신의 고객사만 Service에서 검증)
						.requestMatchers(HttpMethod.POST, "/api/presets").hasRole("CUSTOMER")
						.requestMatchers(HttpMethod.PUT, "/api/presets/**").hasRole("CUSTOMER")
						.requestMatchers(HttpMethod.DELETE, "/api/presets/**").hasRole("CUSTOMER")

						// 인증 처리가 필요한 API ( CUSTOMER 권한을 가진 사용자만 결제 부분에 접근 가능 )
						.requestMatchers(
								"/api/payments/status/**",
								"/api/payments",
								"/api/payments/pending",
								"/api/payments/detail/**",
								"/api/payments/status/id/**")
						.hasRole("CUSTOMER")

						// 파일 업로드 api
						.requestMatchers("/api/files/initiate", "/api/files/complete").permitAll()
						// 상대방 쪽에서 있던 관리자 대시보드 ADMIN 접근 제한 유지
						.requestMatchers("/api/admin/**").hasRole("ADMIN")

						// Swagger UI 문서 열어두기
						.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

						// 그 외 모든 요청은 인증 필요
						.anyRequest().authenticated()

				)
				// 사용자 인증(로그인) 처리 (아이디/비밀번호 검증 담당)
				.authenticationProvider(authenticationProvider)

				// 기본 폼 로그인 필터가 실행되기전 JWT를 먼저 검사
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

}
