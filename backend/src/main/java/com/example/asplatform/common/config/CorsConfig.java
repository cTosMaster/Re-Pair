package com.example.asplatform.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

//스프링 시큐리티 설정(.cors())과 결합하면, 전역 CORS 필터가 활성화되어
//모든 크로스-도메인 요청에 대해 자동으로 올바른 CORS 응답 헤더를 붙여 줌
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();

        //모든 출처(Origin) 허용
        cfg.addAllowedOriginPattern("*");
        //모든 HTTP 메서드 허용 (GET, POST, PUT, DELETE 등)
        cfg.addAllowedMethod("*");
        //모든 HTTP 헤더 허용
        cfg.addAllowedHeader("*");
        //쿠키, 인증 헤더 허용
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        //모든 URL 경로에 대해 위 설정 적용
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
