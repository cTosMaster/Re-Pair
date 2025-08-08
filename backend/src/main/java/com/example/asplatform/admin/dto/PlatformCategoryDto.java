// src/main/java/com/example/asplatform/admin/dto/PlatformCategoryDto.java
package com.example.asplatform.admin.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformCategoryDto {
    private Long categoryId;
    private String name;
    private LocalDateTime createdAt;
}
