package com.example.asplatform.item.dto.requestDTO;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RepairItemUpdateRequestDto {
    private String name;
    private Integer price; // null 허용 → 기존 값 유지
    private Long categoryId; // 고객사는 수정 금지이므로 제외
}

