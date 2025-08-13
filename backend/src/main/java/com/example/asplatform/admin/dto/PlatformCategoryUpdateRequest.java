// src/main/java/com/example/asplatform/admin/dto/PlatformCategoryUpdateRequest.java
package com.example.asplatform.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;


@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlatformCategoryUpdateRequest {
    @NotBlank(message = "카테고리 이름은 필수입니다.")
    private String name;
}
