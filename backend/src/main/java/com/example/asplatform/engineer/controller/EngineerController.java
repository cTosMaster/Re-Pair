package com.example.asplatform.engineer.controller;

import com.example.asplatform.engineer.dto.requestDTO.EngineerUpdateRequestDto;
import com.example.asplatform.engineer.dto.responseDTO.EngineerResponseDto;
import com.example.asplatform.engineer.service.EngineerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/engineers")
public class EngineerController {
    private final EngineerService engineerService;

    // 수리기사 등록
    @PostMapping
    public ResponseEntity<String> registerEngineer(@RequestParam Long userId, @RequestParam Long customerId){
        engineerService.registerEngineer(userId,customerId);
        return ResponseEntity.ok("수리기사가 등록되었습니다.");
    }

    // 수리기사 전체 조회
    @GetMapping
    public ResponseEntity<List<EngineerResponseDto>> getAllEngineers(){
        return ResponseEntity.ok(engineerService.getAllEngineers());
    }

    // 수리기사 상세 조회
    @GetMapping("/{engineerId}")
    public ResponseEntity<EngineerResponseDto> getEngineer(@PathVariable Long engineerId) {
        return ResponseEntity.ok(engineerService.getEngineer(engineerId));
    }

    // 수리기사 정보 수정
    @PutMapping("/api/engineers/{engineerId}")
    public ResponseEntity<String> updateEngineer(@PathVariable Long engineerId, @RequestBody EngineerUpdateRequestDto dto) {
        engineerService.updateEngineer(engineerId, dto);
        return ResponseEntity.ok("수리기사 정보가 수정되었습니다.");
    }


    // 수리기사 삭제
    @DeleteMapping
    public ResponseEntity<String> deleteEngineer(@RequestParam Long userId) {
        engineerService.deleteEngineer(userId);
        return ResponseEntity.ok("수리기사가 삭제되었습니다");
    }
}