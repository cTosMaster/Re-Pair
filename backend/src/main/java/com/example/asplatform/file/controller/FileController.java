package com.example.asplatform.file.controller;

import com.example.asplatform.file.dto.*;
import com.example.asplatform.file.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService service;

    /** 프리사인 URL 발급 */
    @PostMapping("/initiate")
    public ResponseEntity<InitiateUploadResponse> initiate(@RequestBody @Valid InitiateUploadRequest req) {
        return ResponseEntity.ok(service.initiate(req));
    }

    /** 업로드 완료 통지 */
    @PostMapping("/complete")
    public ResponseEntity<FileResponse> complete(@RequestBody @Valid CompleteUploadRequest req) {
        return ResponseEntity.ok(service.complete(req));
    }
}
