package com.example.asplatform.engineer.controller;

import com.example.asplatform.engineer.dto.requestDTO.EngineerRequest;
import com.example.asplatform.engineer.dto.responseDTO.EngineerResponse;
import com.example.asplatform.engineer.dto.responseDTO.EngineerStatusResponse;
import com.example.asplatform.engineer.service.EngineerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/engineers")
@RequiredArgsConstructor
public class EngineerController {

    private final EngineerService engineerService;

    //수리기사 등록
    @PostMapping
    public ResponseEntity<Void> registerEngineer(@RequestBody EngineerRequest request) {
        engineerService.registerEngineer(request);
        return ResponseEntity.ok().build();
    }
    // 수리기사 삭제
    @DeleteMapping("/{engineerId}")
    public ResponseEntity<Void> deleteEngineer(@PathVariable Long engineerId) {
        engineerService.deleteEngineer(engineerId);
        return ResponseEntity.noContent().build();
    }
    // 특정 수리기사 조회
    @GetMapping("/{engineerId}")
    public ResponseEntity<EngineerResponse> getEngineer(@PathVariable Long engineerId) {
        return ResponseEntity.ok(engineerService.getEngineer(engineerId));
    }
    // 수리기사 정보 수정
    @PutMapping("/{engineerId}")
    public ResponseEntity<Void> updateEngineer(@PathVariable Long engineerId, @RequestBody EngineerRequest request) {
        engineerService.updateEngineer(engineerId, request);
        return ResponseEntity.ok().build();
    }
    // 전체 수리기사 조회
    @GetMapping
    public ResponseEntity<List<EngineerResponse>> getAllEngineers() {
        return ResponseEntity.ok(engineerService.getAllEngineers());
    }

/**
 * 수리기사의 수리 요청 목록을 상태별로 조회
 * @param engineerId 조회 대상 수리기사의 ID
 * @param status 필터링할 수리 요청 상태 (예: PENDING, IN_PROGRESS 등), 기본값은 'ALL'
 * @param pageable 페이지네이션 정보 (page, size, sort 등)
 * @return 수리기사에게 배정된 수리 요청 목록 (페이징 형식의 EngineerStatusResponse DTO)
 */
    @GetMapping("/engineers/{engineerId}/repair-requests")
    public ResponseEntity<Page<EngineerStatusResponse>> getRepairsByEngineer(
            @PathVariable Long engineerId,
            @RequestParam(defaultValue = "ALL") String status,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        return ResponseEntity.ok(repairRequestService.getRepairsByEngineer(engineerId, status, pageable));
        // 추후 repair-request와 연동
    }

}
