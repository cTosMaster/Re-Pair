package com.example.asplatform.repairHistory.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.repairHistory.domain.RepairHistory;
import com.example.asplatform.repairHistory.dto.responseDTO.RepairStatusHistoryResponseDTO;
import com.example.asplatform.repairHistory.dto.responseDTO.RepairStatusHistoryWrapperDTO;
import com.example.asplatform.repairHistory.repository.RepairHistoryRepository;
import com.example.asplatform.repairRequest.domain.RepairRequest;
import com.example.asplatform.repairRequest.repository.RepairRequestRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RepairHistoryService {

    private final RepairRequestRepository repairRequestRepository;
    private final RepairHistoryRepository repairHistoryRepository;

    /**
     * 특정 수리 요청의 상태 변경 이력을 전체 조회 + 현재 상태 반환
     */
    @Transactional(readOnly = true)
    public RepairStatusHistoryWrapperDTO getRepairStatusHistory(Long repairRequestId) {

        // 1. 수리 요청 정보 가져오기 (현재 상태 포함)
        RepairRequest request = repairRequestRepository.findById(repairRequestId)
                .orElseThrow(() -> new IllegalArgumentException("해당 수리 요청이 존재하지 않습니다."));

        // 2. 해당 요청의 상태 변경 이력 조회
        List<RepairStatusHistoryResponseDTO> historyList = repairHistoryRepository
        		.findByRepairRequestOrderByChangedAtAsc(request)
                .stream()
                .map(RepairStatusHistoryResponseDTO::from)
                .toList();

        // 3. 현재 상태 + 이력 목록으로 감싼 DTO 생성
        return RepairStatusHistoryWrapperDTO.builder()
                .currentStatus(request.getStatus().name())
                .currentStatusLabel(request.getStatus().getLabel())
                .history(historyList)
                .build();
    }
}