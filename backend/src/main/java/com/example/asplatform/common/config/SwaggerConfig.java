package com.example.asplatform.common.config;

import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("A/S Platform API")
                        .version("v1.0")
                        .description("A/S 플랫폼 REST API 문서")
                        .contact(new Contact().name("Re:Piar").email("support@repiar.com"))
                )
                // 전역 보안 요구사항
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                // 컴포넌트에 스키마 정의
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)        // HTTP 인증 타입
                                        .scheme("bearer")                      // Bearer 방식
                                        .bearerFormat("JWT")                   // JWT 토큰 포맷
                                        .in(SecurityScheme.In.HEADER)          // 헤더에 담김
                                        .name("Authorization")                 // 헤더 이름
                        )
                );
    }
}
