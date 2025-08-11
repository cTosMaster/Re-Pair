package com.example.asplatform.engineer.dto.responseDTO;

import com.example.asplatform.engineer.domain.Engineer;
import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class EngineerResponse {
    private Long engineerId;
    private Long userId;
    private Long customerId;
    private boolean isAssigned;

    public static EngineerResponse from(Engineer e) {
        return EngineerResponse.builder()
                .engineerId(e.getUserId())
                .userId(e.getUserId())
                .customerId(e.getCustomerId())
                .isAssigned(e.isAssigned())
                .build();
    }
}
