package com.example.asplatform.file.support;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.HashSet;
import java.util.Set;

@Component
public class FileUrlValidator {

    private final Set<String> allowedHosts = new HashSet<>();

    public FileUrlValidator(
            @Value("${app.s3.bucket}") String bucket,
            @Value("${app.s3.region}") String region,
            @Value("${app.cdn.domain:}") String cdnDomain
    ) {
        // S3 정규 호스트
        allowedHosts.add(bucket + ".s3." + region + ".amazonaws.com");
    }

    /** null/blank는 통과, 값이 있으면 우리 호스트만 허용 */
    public void validateOwnedUrlOrNull(String url) {
        if (url == null || url.isBlank()) return;
        String host = URI.create(url).getHost();
        if (host == null || !allowedHosts.contains(host)) {
            throw new IllegalArgumentException("허용되지 않은 파일 URL입니다.");
        }
    }
}
