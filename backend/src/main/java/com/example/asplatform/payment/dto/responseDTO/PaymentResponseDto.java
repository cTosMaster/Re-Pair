package com.example.asplatform.payment.dto.responseDTO;

import java.time.LocalDateTime;

import com.example.asplatform.common.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentResponseDto {
    private String orderId;
    private String virtualAccountNumber;
    private LocalDateTime virtualAccountExpiredAt;
    private int amount;
    private PaymentStatus status;
}