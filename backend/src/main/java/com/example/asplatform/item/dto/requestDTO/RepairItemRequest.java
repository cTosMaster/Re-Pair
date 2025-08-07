package com.example.asplatform.item.dto.requestDTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RepairItemRequest {
    private Long customerId;
    private Long categoryId;  // 👉 customer_categories 기준
    private String name;
    private Integer price;
}
