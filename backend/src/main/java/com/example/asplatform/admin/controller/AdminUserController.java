// src/main/java/com/example/asplatform/admin/controller/AdminUserController.java
package com.example.asplatform.admin.controller;

import com.example.asplatform.admin.dto.*;
import com.example.asplatform.admin.service.AdminUserService;
import com.example.asplatform.common.enums.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService svc;

    /* 3) 전체 사용자 목록 */
    @GetMapping
    public Page<UserDto> all(@RequestParam(required = false) Role role,
                             Pageable pageable) {
        return svc.getAll(role, pageable);
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

    /* 5) 소프트 delete (비활성화) */
    @PatchMapping("/{id}")
    public ResponseEntity<Void> softDelete(@PathVariable Long id) {
        svc.softDelete(id);
        return ResponseEntity.ok().build();
    }
}
