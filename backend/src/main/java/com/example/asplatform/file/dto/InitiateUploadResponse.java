package com.example.asplatform.file.dto;

public record InitiateUploadResponse(
        String uploadUrl,
        String key,
        String publicUrl
) {}
