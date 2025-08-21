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
						
						//쿠버네티스 프로브 허용 설정
						.requestMatchers("/api/actuator/health", "/api/actuator/health/**").permitAll()

						// 인증·회원가입 API 열어두기
						.requestMatchers(
								"/api/auth/**",
								"/api/users/send-signup-code",
								"/api/users/register",
								"/api/payments/callback",
								"/api/payments/request"

						).permitAll()


						// 프리셋
						.requestMatchers(HttpMethod.GET, "/api/presets/**").hasAnyRole("ADMIN", "CUSTOMER", "ENGINEER")
						.requestMatchers(HttpMethod.POST, "/api/presets").hasRole("CUSTOMER") // 등록
						.requestMatchers(HttpMethod.PUT, "/api/presets/**").hasRole("CUSTOMER") // 수정
						.requestMatchers(HttpMethod.DELETE, "/api/presets/**").hasRole("CUSTOMER") // 삭제
						.requestMatchers(HttpMethod.POST, "/api/presets/restore/**").hasRole("CUSTOMER") // 복원
						.requestMatchers(HttpMethod.POST, "/api/presets/calculate", "/api/presets/*").hasAnyRole("ADMIN", "CUSTOMER", "ENGINEER") // 금액 계산 & 미리보기

						// 최종 견적서
						.requestMatchers(HttpMethod.POST, "/api/repair/*/final-estimate").hasRole("ENGINEER")
						.requestMatchers(HttpMethod.PUT, "/api/repair/*/final-estimate").hasRole("ENGINEER")
						.requestMatchers(HttpMethod.GET, "/api/repair/**").hasAnyRole("CUSTOMER", "ENGINEER", "USER")
						.requestMatchers(HttpMethod.GET, "/api/repair/**").hasAnyRole("CUSTOMER", "ENGINEER", "USER")

						// 결제
						.requestMatchers(
							"/api/payments/status/**",
							"/api/payments",
							"/api/payments/pending",
							"/api/payments/detail/**",
							"/api/payments/status/id/**"
						).hasRole("CUSTOMER")
						
						// 수리 요청
						.requestMatchers(
						    "/api/repair-requests/change"
						).hasAnyRole("ENGINEER", "CUSTOMER", "ADMIN")

						// 파일 업로드
						.requestMatchers("/api/files/initiate", "/api/files/complete").permitAll()

						// 관리자
						.requestMatchers("/api/admin/platform-categories").hasAnyRole("ADMIN", "CUSTOMER", "USER")
						.requestMatchers("/api/admin/**").hasRole("ADMIN")

						// Swagger
						.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

						.anyRequest().authenticated()
					)
					.authenticationProvider(authenticationProvider)
					.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

				return http.build();
	}

}
