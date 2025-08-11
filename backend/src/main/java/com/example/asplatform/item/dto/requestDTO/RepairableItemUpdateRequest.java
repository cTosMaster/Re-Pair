package com.example.asplatform.item.dto.requestDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RepairableItemUpdateRequest {
    private Long categoryId;
    private String name;
    private Integer price;
}

