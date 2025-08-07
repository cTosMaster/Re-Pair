package com.example.asplatform.item.dto.responseDTO;

import com.example.asplatform.item.domain.RepairItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class RepairItemResponse {
    private Long itemId;
    private Long customerId;
    private Long categoryId;
    private String name;
    private Integer price;
    private LocalDateTime createdAt;

    public static RepairItemResponse from(RepairItem item) {
        return RepairItemResponse.builder()
                .itemId(item.getItemId())
                .customerId(item.getCustomerId())
                .categoryId(item.getCategoryId())
                .name(item.getName())
                .price(item.getPrice())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
