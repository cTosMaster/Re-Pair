package com.example.asplatform.repair.service;

import java.util.Base64;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

@Component
@RequiredArgsConstructor
public class S3Uploader {
    private final S3Client s3Client;
    @Value("${app.s3.bucket}")
    private String bucket;

    @Value("${app.s3.region}")
    private String region;
    
    public String uploadBase64Image ( String base64Data , String folder) {
    	byte[] bytes = Base64.getDecoder().decode(base64Data.split(",")[1]);
    	
    	// currentTimeMillies() 사용하여 파일 이름 중복 가능성을 낮춤
    	String key = folder + "/" + System.currentTimeMillis() + ".png";
    	
    	// 안전하게 base64 앞부분 mime 타입을 파싱해서 적용
    	String mimeType = base64Data.substring(base64Data.indexOf(":")+1, base64Data.indexOf(";"));
    	
    	PutObjectRequest request = PutObjectRequest.builder() 
    			.bucket(bucket)
    			.key(key)
    			.contentType(mimeType)
                .build();
    	
        PutObjectResponse response = s3Client.putObject(request, 
                software.amazon.awssdk.core.sync.RequestBody.fromBytes(bytes));
        
        return "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
    }

}
