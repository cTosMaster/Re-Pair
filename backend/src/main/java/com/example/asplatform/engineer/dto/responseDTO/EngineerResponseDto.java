package com.example.asplatform.engineer.dto.responseDTO;

import com.example.asplatform.engineer.domain.Engineer;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class EngineerResponseDto {

    private Long engineerId;
    private String name;
    private String username;
    private String email;
    private String phone;
    private Boolean isAssigned;
    private LocalDateTime assignedAt;

    // User 추가해야함
    public static EngineerResponseDto from(Engineer engineer) {
        return new EngineerResponseDto(
                engineer.getId(), // 기사 Id
                engineer.getUser().getName(),
                engineer.getUser().getUsername(), // login Id
                engineer.getUser().getEmail(),
                engineer.getUser().getPhone(),
                engineer.getIsAssigned(),
                engineer.getAssignedAt()
        );
    }
}
