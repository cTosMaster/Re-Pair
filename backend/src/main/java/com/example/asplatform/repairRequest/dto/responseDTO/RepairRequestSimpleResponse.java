package com.example.asplatform.repairRequest.dto.responseDTO;

import com.example.asplatform.common.enums.RepairStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

// 관리자, 수리기사용 접수처리 승인/반려용
@Value
@Builder
public class RepairRequestSimpleResponse {
    Long requestId;
    RepairStatus status;
    LocalDateTime updatedAt;

    public static RepairRequestSimpleResponse of(Long id, RepairStatus status) {
        return RepairRequestSimpleResponse.builder()
                .requestId(id)
                .status(status)
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
