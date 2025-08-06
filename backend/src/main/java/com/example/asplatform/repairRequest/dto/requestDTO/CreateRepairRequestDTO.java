package com.example.asplatform.repairRequest.dto.requestDTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRepairRequestDTO {
    private Long categoryId;            // 카테고리 (예: 휴대폰)
    private Long repairableItemId;      // 세부 제품 (예: 갤럭시 S7)
    private String title;               // 제목
    private String requestContent;      // 상세 증상
}