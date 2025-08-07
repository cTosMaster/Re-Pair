package com.example.asplatform.repairRequest.dto.requestDTO;

import com.example.asplatform.common.enums.RepairStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ManualStatusChangeRequestDto {
    private RepairStatus targetStatus;
    
    @NotBlank(message = "취소 사유는 필수입니다.")
    private String memo; // 수동 취소 사유
}
