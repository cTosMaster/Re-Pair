package com.example.asplatform.engineer.dto.responseDTO;

import com.example.asplatform.engineer.domain.Engineer;
import lombok.AllArgsConstructor;
import lombok.Getter;

// 드롭다운이나 리스트 최소 표시
@Getter
@AllArgsConstructor
public class EngineerSimpleDto {
    private Long id;
    private String name;

    public static EngineerSimpleDto from(Engineer engineer) {
        return new EngineerSimpleDto(
                engineer.getId(),
                engineer.getUser().getName()
        );
    }
}

