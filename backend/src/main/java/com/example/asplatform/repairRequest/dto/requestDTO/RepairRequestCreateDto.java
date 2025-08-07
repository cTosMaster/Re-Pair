package com.example.asplatform.repairRequest.dto.requestDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@NoArgsConstructor
public class RepairRequestCreateDto {

    @NotNull
    private Long categoryId; // 고객사 카테고리 ID

    @NotNull
    private Long repairableItemId; // 수리 항목 ID

    @NotBlank
    private String title; // 수리 제목

    @NotBlank
    private String description; // 상세 내용
    
    @NotBlank
    private String contactPhone; // 연락처
    
}