package com.example.asplatform.repairHistory.dto.responseDTO;

import java.time.LocalDateTime;

import com.example.asplatform.repairHistory.domain.RepairHistory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RepairStatusHistoryResponseDTO { //상태 이력 1건 (이전 상태, 새로운 상태, 변경자, 시간)

	private String previousStatus;
    private String previousStatusLabel;

    private String newStatus;
    private String newStatusLabel;
    
    private Long changedByUserId;
    private String changedByUserName;
    private LocalDateTime changedAt;


    public static RepairStatusHistoryResponseDTO from(RepairHistory history) {
        return RepairStatusHistoryResponseDTO.builder()
                .previousStatus(history.getPreviousStatus() != null ? history.getPreviousStatus().name() : null)
                .previousStatusLabel(history.getPreviousStatus() != null ? history.getPreviousStatus().getLabel() : null)
                .newStatus(history.getNewStatus().name())
                .newStatusLabel(history.getNewStatus().getLabel())
                .changedByUserId(history.getChangedBy().getId())
                .changedByUserName(history.getChangedBy().getName()) // name 또는 email 등 원하는 값 사용
                .changedAt(history.getChangedAt())
                .build();
    }
}