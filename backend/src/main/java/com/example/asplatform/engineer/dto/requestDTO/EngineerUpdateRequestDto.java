package com.example.asplatform.engineer.dto.requestDTO;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class EngineerUpdateRequestDto {
    private Boolean isAssigned;
    private LocalDateTime assignedAt;
}

