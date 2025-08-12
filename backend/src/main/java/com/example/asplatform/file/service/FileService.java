package com.example.asplatform.file.service;

import com.example.asplatform.file.dto.CompleteUploadRequest;
import com.example.asplatform.file.dto.FileResponse;
import com.example.asplatform.file.dto.InitiateUploadRequest;
import com.example.asplatform.file.dto.InitiateUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {

    private final S3Presigner presigner;

    @Value("${app.s3.bucket}") private String bucket;
    @Value("${app.s3.region}") private String region;
    @Value("${app.cdn.domain:}") private String cdnDomain;

    private static final Set<String> ALLOWED = Set.of(
            "image/jpeg","image/png","image/webp","application/pdf"
    );

    public InitiateUploadResponse initiate(InitiateUploadRequest req) {
        String ct = Optional.ofNullable(req.contentType()).orElse("application/octet-stream");
        if (!ALLOWED.contains(ct)) {
            throw new IllegalArgumentException("이미지(JPEG/PNG/WEBP) 또는 PDF만 업로드 가능합니다.");
        }

        String ext = extractExtension(req.fileName());
        String key = buildKey(ext);

        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(ct)
                .contentLength(req.size()) // 브라우저 PUT 헤더의 Content-Type과 반드시 동일해야 함
                .build();

        PresignedPutObjectRequest presigned = presigner.presignPutObject(
                PutObjectPresignRequest.builder()
                        .signatureDuration(Duration.ofMinutes(10))
                        .putObjectRequest(put)
                        .build()
        );

        return new InitiateUploadResponse(presigned.url().toString(), key, buildPublicUrl(key));
    }

    public FileResponse complete(CompleteUploadRequest req) {
        // 메타데이터를 DB에 따로 저장하지 않는 구성이라면 이대로 반환만
        return new FileResponse(null, req.key(), buildPublicUrl(req.key()));
    }

    /* ---------- helpers ---------- */

    private String extractExtension(String fileName) {
        if (fileName == null) return "bin";
        int dot = fileName.lastIndexOf('.');
        return (dot >= 0 && dot < fileName.length() - 1) ? fileName.substring(dot + 1) : "bin";
    }

    private String buildKey(String ext) {
        String date = LocalDate.now().toString(); // yyyy-MM-dd
        return "uploads/%s/%s.%s".formatted(date, UUID.randomUUID(), ext);
    }

    private String buildPublicUrl(String key) {
        if (cdnDomain != null && !cdnDomain.isBlank()) {
            return "https://" + cdnDomain + "/" + key;
        }
        // 버킷이 Private이면 이 URL은 직접 열람 시 403일 수 있음(표시는 CloudFront 또는 presigned GET 권장)
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }
}
