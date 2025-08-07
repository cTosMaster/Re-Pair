package com.example.asplatform.engineer.dto.responseDTO;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class EngineerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private boolean isAssigned;
    private LocalDateTime assignedAt;
    private Long customerId;
    private String customerName;
}