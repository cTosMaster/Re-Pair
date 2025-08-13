// src/main/java/com/example/asplatform/admin/controller/AdminUserController.java
package com.example.asplatform.admin.controller;

import com.example.asplatform.admin.dto.*;
import com.example.asplatform.admin.service.AdminUserService;
import com.example.asplatform.common.enums.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService svc;

    // ✅ 정렬 화이트리스트(실제 User 엔티티 필드명으로 맞추세요)
    private static final Set<String> ALLOWED_SORTS =
            Set.of("id", "email", "name", "role", "createdAt", "updatedAt", "lastLoginAt");
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "createdAt");

    /* 3) 전체 사용자 목록 */
    @GetMapping
    public ResponseEntity<Page<UserDto>> all(
            @RequestParam(required = false) Role role,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Pageable safe = sanitizePageable(pageable);
        return ResponseEntity.ok(svc.getAll(role, safe));
    }

    /* 3-1) 단일 사용자 조회 */
    @GetMapping("/{id}")
    public UserDto getOne(@PathVariable Long id) {
        return svc.getOne(id);
    }

    /* 4) 정보 수정 */
    @PutMapping("/{id}")
    public UserDto update(@PathVariable Long id,
                          @Valid @RequestBody UserUpdateRequest req) {
        return svc.update(id, req);
    }

    /* 5) 하드 delete */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> hardDelete(@PathVariable Long id) {
        svc.hardDelete(id);
        return ResponseEntity.noContent().build();
    }

    /* 5-2) 계정 비활성화 (소프트 delete) */
    @PatchMapping("/{id}/disable")
    public ResponseEntity<Void> disable(@PathVariable Long id) {
        svc.softDelete(id);
        return ResponseEntity.ok().build();
    }

    // === 내부 유틸: 정렬 화이트리스트 필터 + 기본 정렬 대체 ===
    private Pageable sanitizePageable(Pageable pageable) {
        Sort requested = pageable.getSort();
        Sort valid = Sort.unsorted();

        if (requested != null && requested.isSorted()) {
            for (Sort.Order o : requested) {
                if (ALLOWED_SORTS.contains(o.getProperty())) {
                    valid = valid.and(Sort.by(o)); // asc/desc 그대로 유지
                }
            }
        }

        if (valid.isUnsorted()) {
            valid = DEFAULT_SORT; // 정렬이 없거나 전부 무효면 기본 정렬
        }

        int page = Math.max(0, pageable.getPageNumber());
        int size = pageable.getPageSize() > 0 ? pageable.getPageSize() : 20;

        return PageRequest.of(page, size, valid);
    }
}
