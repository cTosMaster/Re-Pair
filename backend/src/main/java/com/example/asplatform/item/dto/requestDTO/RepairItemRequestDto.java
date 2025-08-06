package com.example.asplatform.item.dto.requestDTO;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RepairItemRequestDto {

    private String name;       // 제품 이름
    private Long categoryId;   // 카테고리 ID (셀렉트 박스에서 선택)
    private int price;         // 단가 (원)
    private Long customerId;   // 고객사 ID (프론트에서 넘김)
}
