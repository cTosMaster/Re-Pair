// src/main/java/com/example/asplatform/admin/controller/AdminCustomerController.java
package com.example.asplatform.admin.controller;

import com.example.asplatform.admin.dto.*;
import com.example.asplatform.admin.service.AdminCustomerService;
import com.example.asplatform.common.enums.CustomerStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCustomerController {

    private final AdminCustomerService svc;

    /* 1) 등록 요청(PENDING) 목록 */
    @GetMapping("/pending")
    public Page<CustomerDto> pending(Pageable pageable) {
        return svc.getPending(pageable);
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
    public Page<CustomerDto> all(Pageable pageable) {
        return svc.getAll(pageable);
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
}
