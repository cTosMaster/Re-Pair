// src/main/java/com/example/asplatform/admin/controller/AdminCustomerController.java
package com.example.asplatform.admin.controller;

import com.example.asplatform.admin.dto.*;
import com.example.asplatform.admin.service.AdminCustomerService;
import com.example.asplatform.common.enums.CustomerStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerController {

    private final AdminCustomerService svc;

    // ✅ 정렬 화이트리스트 + 기본 정렬 (필드명은 Customer 엔티티에 실제 존재해야 함)
    private static final Set<String> ALLOWED_SORTS =
            Set.of("id", "companyName", "status", "createdAt", "updatedAt");
    private static final Sort DEFAULT_SORT = Sort.by(Sort.Direction.DESC, "createdAt");

    /* 1) 등록 요청(PENDING) 목록 */
    @GetMapping("/pending")
    public ResponseEntity<Page<CustomerDto>> pending(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Pageable safe = sanitizePageable(pageable);
        return ResponseEntity.ok(svc.getPending(safe));
    }

    /* 1) 승인 */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approve(@PathVariable Long id) {
        svc.changeStatus(id, CustomerStatus.APPROVED);
        return ResponseEntity.ok().build();
    }

    /* 1) 반려 */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long id) {
        svc.changeStatus(id, CustomerStatus.REJECTED);
        return ResponseEntity.ok().build();
    }

    /* 2) 승인된 고객사 목록 */
    @GetMapping
    public ResponseEntity<Page<CustomerDto>> all(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Pageable safe = sanitizePageable(pageable);
        return ResponseEntity.ok(svc.getAll(safe));
    }

    /* 2) 정보 수정 */
    @PutMapping("/{id}")
    public CustomerDto update(@PathVariable Long id,
                              @Valid @RequestBody CustomerUpdateRequest req) {
        return svc.update(id, req);
    }

    /* 2-1) 삭제 (하드 딜리트) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        svc.delete(id, true);
        return ResponseEntity.noContent().build();
    }

    /* 2-2) 등록 취소 (상태 → REJECTED) */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        svc.changeStatus(id, CustomerStatus.REJECTED);
        return ResponseEntity.ok().build();
    }

    /* 등록폼 상세 조회 ─ 내용보기 */
    @GetMapping("/{id}")
    public CustomerDto detail(@PathVariable Long id) {
        return svc.getOne(id);
    }

    // === 내부 유틸: 정렬 화이트리스트 필터 + 기본 정렬 대체 ===
    private Pageable sanitizePageable(Pageable pageable) {
        Sort sort = pageable.getSort();
        Sort valid = Sort.unsorted();

        if (sort != null && sort.isSorted()) {
            for (Sort.Order o : sort) {
                if (ALLOWED_SORTS.contains(o.getProperty())) {
                    valid = valid.and(Sort.by(o));
                }
            }
        }
        if (valid.isUnsorted()) valid = DEFAULT_SORT;

        int page = Math.max(0, pageable.getPageNumber());
        int size = pageable.getPageSize() > 0 ? pageable.getPageSize() : 10;

        return PageRequest.of(page, size, valid);
    }
}
