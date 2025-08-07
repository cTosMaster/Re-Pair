package com.example.asplatform.payment.dto.responseDTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TossCallbackDto {
    private String createdAt;
    private String secret;
    private String orderId;
    private String status;
    private String transactionKey;
    private String paymentKey;  
    private String method;      
}