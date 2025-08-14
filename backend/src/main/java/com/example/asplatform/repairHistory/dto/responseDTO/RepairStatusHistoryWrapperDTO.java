package com.example.asplatform.repairHistory.dto.responseDTO;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RepairStatusHistoryWrapperDTO { //현재 상태 + 상태 흐름 전체

    private String currentStatus;
    private String currentStatusLabel;
    private List<RepairStatusHistoryResponseDTO> history;
}
