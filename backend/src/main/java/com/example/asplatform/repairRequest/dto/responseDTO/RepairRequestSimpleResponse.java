package com.example.asplatform.repairRequest.dto.responseDTO;

import com.example.asplatform.common.enums.RepairStatus;
import lombok.*;

import java.time.LocalDateTime;

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
