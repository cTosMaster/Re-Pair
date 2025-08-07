package com.example.asplatform.category.dto.responseDTO;

import com.example.asplatform.category.domain.CustomerCategory;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CustomerCategoryResponse{
    private Long categoryId;
    private String name;

    public static CustomerCategoryResponse from(CustomerCategory category) {
        return CustomerCategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .name(category.getName())
                .build();
    }
}
