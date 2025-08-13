package com.example.asplatform.repairRequest.dto.responseDTO;

import java.time.LocalDateTime;

import com.example.asplatform.common.enums.RepairStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RepairRequestSimpleResponse {
    private Long requestId;
    private RepairStatus status;
    private LocalDateTime updatedAt;
    private Long engineerId;
}
