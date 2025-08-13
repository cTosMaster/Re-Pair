package com.example.asplatform.file.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record InitiateUploadRequest(
        @NotBlank String fileName,
        @NotBlank String contentType,
        @PositiveOrZero long size
) {}
