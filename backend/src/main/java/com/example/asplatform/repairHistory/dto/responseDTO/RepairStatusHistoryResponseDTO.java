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

    private String changedBy;
    private LocalDateTime changedAt;

    public static RepairStatusHistoryResponseDTO from(RepairHistory history) {
        return RepairStatusHistoryResponseDTO.builder()
                .previousStatus(history.getPreviousStatus().name())
                .previousStatusLabel(history.getPreviousStatus().getLabel())
                .newStatus(history.getNewStatus().name())
                .newStatusLabel(history.getNewStatus().getLabel())
                .changedBy(history.getChangedBy())
                .changedAt(history.getChangedAt())
                .build();
    }
}