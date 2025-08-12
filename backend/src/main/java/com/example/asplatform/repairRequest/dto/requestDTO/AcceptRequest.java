package com.example.asplatform.repairRequest.dto.requestDTO;

public class AcceptRequest {
    private Long engineerId; // CUSTOMER 필수, ENGINEER는 무시
    private String memo;     // 선택
}