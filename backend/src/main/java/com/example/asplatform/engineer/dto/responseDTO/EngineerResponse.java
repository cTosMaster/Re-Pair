package com.example.asplatform.engineer.dto.responseDTO;

import com.example.asplatform.engineer.domain.Engineer;
import com.example.asplatform.user.domain.User;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter @Builder
public class EngineerResponse {
    private Long engineerId;
    private String name;
    private String email;
    private String phone;
    private String statusLabel;   // "대기 중" / "수리 중"
    private LocalDate registeredAt;

    public static EngineerResponse from(Engineer e) {
        User u = e.getUser(); // Engineer ↔ User 연관 전제
        return EngineerResponse.builder()
                .engineerId(e.getUserId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .statusLabel(e.isAssigned() ? "수리 중" : "대기 중")
                .registeredAt(u.getCreatedAt().toLocalDate())
                .build();
    }
}
