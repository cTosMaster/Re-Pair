package com.example.asplatform.payment.dto.responseDTO;

import lombok.Data;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Toss Payments 가상계좌 발급 응답 DTO
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TossResponse {

	private VirtualAccount virtualAccount;          
    private String orderId;            
    private String customerName;      
    private String status;
    private String code;
    private String message;
    private String paymentKey;
    private String method;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class VirtualAccount {
        private String accountNumber;      
        private String bankCode;           
        private OffsetDateTime dueDate;  
    }
}