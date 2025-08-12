// src/main/java/com/example/asplatform/admin/controller/AdminPlatformCategoryController.java
package com.example.asplatform.admin.controller;

import com.example.asplatform.admin.dto.*;
import com.example.asplatform.admin.service.PlatformCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/admin/platform-categories")
@RequiredArgsConstructor
public class AdminPlatformCategoryController {
    private final PlatformCategoryService service;

    /** 전체 조회 */
    @GetMapping
    public ResponseEntity<Page<PlatformCategoryDto>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "categoryId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir), sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(service.findAll(pageable));
    }

    /** 생성 */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlatformCategoryDto> create(
            @Valid @RequestBody PlatformCategoryCreateRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    /** 수정 */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlatformCategoryDto> update(
            @PathVariable Long id,
            @Valid @RequestBody PlatformCategoryUpdateRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    /** 삭제 */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
