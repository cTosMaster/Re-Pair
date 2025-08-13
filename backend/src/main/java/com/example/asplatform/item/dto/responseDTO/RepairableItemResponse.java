package com.example.asplatform.item.dto.responseDTO;

import com.example.asplatform.item.domain.RepairableItem;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class RepairableItemResponse {

    private Long itemId;
    private Long customerId;
    private String customerName;
    private Long categoryId;
    private String categoryName;
    private String name;         // 제품명
    private Integer price;       // 단가
    private LocalDateTime createdAt;

    public static RepairableItemResponse from(RepairableItem item) {
        return RepairableItemResponse.builder()
                .itemId(item.getItemId())
                .customerId(item.getCustomer().getId())
                .customerName(item.getCustomer().getCompanyName())
                .categoryId(item.getCategory().getId())
                .categoryName(item.getCategory().getName())
                .name(item.getName())
                .price(item.getPrice())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
