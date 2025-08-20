package com.example.asplatform.customer.dto.responseDTO;

public record CustomerCardResponse(
        Long customerId,
        String companyName,
        String region,          // "서울 송파구"
        double avgRating       // 0.0 ~ 5.0 (소수 1자리 반올림)
) {}

