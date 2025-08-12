package com.example.asplatform.repairRequest.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.repairRequest.service.RepairRequestService;

import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/repair-requests")
@Validated
public class RepairRequestController {

    private final RepairRequestService repairRequestService;

    /**
     * 1) 접수 + 담당자 배정 (PENDING -> WAITING_FOR_REPAIR)
     * 예: POST /api/repair-requests/123/accept?engineerUserId=45
     */
    @PostMapping("/{requestId}/accept")
    public ResponseEntity<Void> accept(
            @AuthenticationPrincipal UserDetails me,
            @PathVariable @Positive Long requestId,
            @RequestParam @Positive Long engineerUserId
    ) {
        repairRequestService.accept(requestId, engineerUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 2) 반려/취소 처리 (-> CANCELED)
     * 예: POST /api/repair-requests/123/reject
     */
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<Void> reject(
            @AuthenticationPrincipal UserDetails me,
            @PathVariable @Positive Long requestId
    ) {
        repairRequestService.reject(requestId /*, reason(Optional) */);
        return ResponseEntity.noContent().build();
    }

    /**
     * 3) 배정/재배정 (상태 유지, PENDING이면 WAITING_FOR_REPAIR로 전환)
     * 예: PATCH /api/repair-requests/123/assign?engineerUserId=67
     */
    @PatchMapping("/{requestId}/assign")
    public ResponseEntity<Void> assignEngineer(
            @AuthenticationPrincipal UserDetails me,
            @PathVariable @Positive Long requestId,
            @RequestParam @Positive Long engineerUserId
    ) {
        repairRequestService.assignEngineer(requestId, engineerUserId);
        return ResponseEntity.noContent().build();
    }
}
