package com.example.asplatform.category.dto.responseDTO;

import com.example.asplatform.category.domain.CustomerCategory;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CustomerCategoryResponse{
    private Long id;
    private String name;

    public static CustomerCategoryResponse from(CustomerCategory category) {
        return CustomerCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }
}
