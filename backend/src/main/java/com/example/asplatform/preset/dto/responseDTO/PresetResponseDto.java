package com.example.asplatform.preset.dto.responseDTO;

import com.example.asplatform.preset.domain.Preset;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

/**
 * ✅ 프리셋 응답 dto
 * - 프리셋 아이디
 * - 카테고리 아이디
 * - 제품 아이디
 * - 프리셋 이름
 * - 프리셋 설명
 * - 프리셋 가격
 */
@Getter
@Setter
@Builder
public class PresetResponseDto {
    private Long presetId;
    private Long categoryId;
    private Long itemId;
    private String name;
    private String description;
    private Integer price;
    
    // Entity -> Dto 변환 메서드 
    public static PresetResponseDto from(Preset preset) {
        return PresetResponseDto.builder()
            .presetId(preset.getPresetId())
            .categoryId(preset.getCategory().getCategoryId())
            .itemId(preset.getItem().getItemId())
            .name(preset.getName())
            .description(preset.getDescription())
            .price(preset.getPrice())
            .build();
    }
}