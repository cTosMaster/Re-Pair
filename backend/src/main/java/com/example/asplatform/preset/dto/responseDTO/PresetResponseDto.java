package com.example.asplatform.preset.dto.responseDTO;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PresetResponseDto {
    private Long presetId;
    private Long categoryId;
    private Long itemId;
    private String name;
    private String description;
    private Integer price;
    private LocalDateTime createdAt;
}
