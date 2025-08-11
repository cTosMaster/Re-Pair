package com.example.asplatform.preset.dto.requestDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PresetRequestDto {
    @NotNull(message = "Category ID is required.")
    private Long categoryId;

    @NotNull(message = "Item ID is required.")
    private Long itemId;

    @NotBlank(message = "Preset name is required.")
    private String name;

    @NotBlank(message = "Description is required.")
    private String description;

    @NotNull(message = "Price is required.")
    private Integer price;
}
