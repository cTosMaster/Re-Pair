// src/main/java/com/example/asplatform/file/config/S3Config.java
package com.example.asplatform.file.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {

    @Bean(destroyMethod = "close")
    public S3Presigner s3Presigner(
            @Value("${app.s3.region}") String region,
            @Value("${AWS_ACCESS_KEY_ID:}") String accessKey,
            @Value("${AWS_SECRET_ACCESS_KEY:}") String secretKey
    ) {
        S3Presigner.Builder builder = S3Presigner.builder()
                .region(Region.of(region)); // us-east-2 등 yml에서 주입

        if (accessKey != null && !accessKey.isBlank()
                && secretKey != null && !secretKey.isBlank()) {
            AwsCredentialsProvider provider =
                    StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey));
            builder.credentialsProvider(provider);
        } else {
            // OS 환경변수, 프로필(~/.aws/credentials), EC2/ECS Role 등 기본 체인 사용
            builder.credentialsProvider(DefaultCredentialsProvider.create());
        }

        return builder.build();
    }
}
