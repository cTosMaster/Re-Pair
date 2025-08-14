package com.example.asplatform.category.dto.responseDTO;

import com.example.asplatform.category.domain.CustomerCategory;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CustomerCategoryResponse{
    private Long id;
    private String name;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private java.time.LocalDateTime createdAt;

    public static CustomerCategoryResponse from(CustomerCategory category) {
        return CustomerCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
