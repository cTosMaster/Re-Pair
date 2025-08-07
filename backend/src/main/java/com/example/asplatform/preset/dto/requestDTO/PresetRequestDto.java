package com.example.asplatform.preset.dto.requestDTO;

import lombok.Getter;
import lombok.Setter;

/**
 * ✅ 프리셋 요청 dto
 * - 카테고리 아이디
 * - 제품 아이디
 * - 프리셋 이름
 * - 프리셋 설명
 * - 요금
 */
@Getter
@Setter
public class PresetRequestDto {
    private Long categoryId;
    private Long itemId;
    private String name;
    private String description;
    private Integer price;
}
