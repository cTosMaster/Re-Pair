package com.example.asplatform.item.dto.responseDTO;

import com.example.asplatform.item.domain.RepairItem;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.format.DateTimeFormatter;

@Getter
@AllArgsConstructor
public class RepairItemResponseDto {
    private Long id;
    private String categoryName;  // 카테고리명
    private String name;          // 제품명
    private int price;            // 기본 단가
    private String createdAt;     // 등록일자 (yyyy.MM.dd)

    public static RepairItemResponseDto from(RepairItem item) {
        return new RepairItemResponseDto(
                item.getCategory().getName(),
                item.getName(),
                item.getPrice(),
                item.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy.MM.dd"))
        );
    }
}
