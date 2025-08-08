package com.example.asplatform.engineer.controller;

import com.example.asplatform.engineer.dto.requestDTO.EngineerRequest;
import com.example.asplatform.engineer.dto.requestDTO.ReassignEngineerRequest;
import com.example.asplatform.engineer.dto.requestDTO.UpdateEngineerRequest;
import com.example.asplatform.engineer.dto.responseDTO.EngineerResponse;
import com.example.asplatform.engineer.service.EngineerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/engineers")
@RequiredArgsConstructor
public class EngineerController {

    private final EngineerService engineerService;

    // 수리기사 등록
    @PostMapping
    public ResponseEntity<Void> createEngineer(@RequestBody EngineerRequest request) {
        engineerService.createEngineer(request);
        return ResponseEntity.ok().build();
    }

    // 수리기사 정보 수정 (이름, 이메일, 전화번호)
    @PutMapping("/{engineerId}")
    public ResponseEntity<Void> updateEngineer(@PathVariable Long engineerId,
                                               @RequestBody UpdateEngineerRequest request) {
        engineerService.updateEngineer(engineerId, request);
        return ResponseEntity.ok().build();
    }

    // 수리기사 재배정 (isAssigned 상태)
    @PatchMapping("/{engineerId}/reassign")
    public ResponseEntity<Void> reassignEngineer(@PathVariable Long engineerId,
                                                 @RequestBody ReassignEngineerRequest request) {
        engineerService.reassignEngineer(engineerId, request);
        return ResponseEntity.ok().build();
    }



    // 수리기사 삭제
    @DeleteMapping("/{engineerId}")
    public ResponseEntity<Void> deleteEngineer(@PathVariable Long engineerId) {
        engineerService.deleteEngineer(engineerId);
        return ResponseEntity.noContent().build();
    }

    // 수리기사 상세 조회
    @GetMapping("/{engineerId}")
    public ResponseEntity<EngineerResponse> getEngineer(@PathVariable Long engineerId) {
        return ResponseEntity.ok(engineerService.getEngineer(engineerId));
    }

    // 전체 수리기사 목록 조회
    @GetMapping
    public ResponseEntity<List<EngineerResponse>> getAllEngineers() {
        return ResponseEntity.ok(engineerService.getAllEngineers());
    }
}
