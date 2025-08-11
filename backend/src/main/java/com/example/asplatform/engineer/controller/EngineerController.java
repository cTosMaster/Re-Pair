package com.example.asplatform.engineer.controller;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.engineer.dto.requestDTO.EngineerRequest;
import com.example.asplatform.engineer.dto.requestDTO.UpdateEngineerRequest;
import com.example.asplatform.engineer.dto.responseDTO.EngineerResponse;
import com.example.asplatform.engineer.service.EngineerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/engineers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class EngineerController {

    private final EngineerService engineerService;

    /** 수리기사 등록 (CUSTOMER 권한) */
    @PostMapping
    public ResponseEntity<EngineerResponse> createEngineer(
            @Valid @RequestBody EngineerRequest request,
            @AuthenticationPrincipal CustomUserDetails user // 현재 요구사항상 사용 안 함 (일단 남김)
    ) {
        EngineerResponse created = engineerService.createEngineer(request);
        return ResponseEntity
                .created(URI.create("/api/engineers/" + created.getEngineerId()))
                .body(created);
    }

    /** 수리기사 정보 수정 (이름/이메일/전화) */
    @PutMapping("/{engineerId}")
    public ResponseEntity<Void> updateEngineer(
            @PathVariable Long engineerId,
            @Valid @RequestBody UpdateEngineerRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        engineerService.updateEngineer(engineerId, request);
        return ResponseEntity.noContent().build();
    }

    /** 수리기사 삭제 */
    @DeleteMapping("/{engineerId}")
    public ResponseEntity<Void> deleteEngineer(
            @PathVariable Long engineerId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        engineerService.deleteEngineer(engineerId);
        return ResponseEntity.noContent().build();
    }

    /** 수리기사 단건 조회 */
    @GetMapping("/{engineerId}")
    public ResponseEntity<EngineerResponse> getEngineer(
            @PathVariable Long engineerId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(engineerService.getEngineer(engineerId));
    }

    /** 수리기사 목록 (페이징) **/
    @GetMapping
    public ResponseEntity<Page<EngineerResponse>> getEngineers(
            @PageableDefault(sort = "userId") Pageable pageable
    ) {
        return ResponseEntity.ok(engineerService.getEngineers(pageable));
    }
}
