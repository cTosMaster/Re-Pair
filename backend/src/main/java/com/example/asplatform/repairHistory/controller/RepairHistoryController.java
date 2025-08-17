package com.example.asplatform.repairHistory.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.repairHistory.dto.responseDTO.RepairStatusHistoryWrapperDTO;
import com.example.asplatform.repairHistory.service.RepairHistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/repairs/status-history")
public class RepairHistoryController {


    private final RepairHistoryService repairHistoryService;
    

    /**
     * 특정 수리 요청의 상태 변경 이력 + 현재 상태 반환
     * @param repairRequestId (수리 요청 ID)
     */
    @GetMapping("/{repairRequestId}")
    public ResponseEntity<RepairStatusHistoryWrapperDTO> getRepairHistory(
            @PathVariable Long repairRequestId) {

        RepairStatusHistoryWrapperDTO response = repairHistoryService.getRepairStatusHistory(repairRequestId);
        return ResponseEntity.ok(response);
    }   
    
}