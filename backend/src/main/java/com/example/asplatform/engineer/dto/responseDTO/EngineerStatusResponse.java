package com.example.asplatform.engineer.dto.responseDTO;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

// 수리기사 대쉬보드에 필요한 내용 전달
@Getter
@Builder
public class EngineerStatusResponse {
    private Long requestId;
    private String userName;
    private String userPhone;
    private String title;
    private String status;
    private LocalDate createdAt;
}
