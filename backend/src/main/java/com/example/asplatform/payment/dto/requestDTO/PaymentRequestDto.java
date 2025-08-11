package com.example.asplatform.payment.dto.requestDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDto {
	
    private String orderName;
    private Integer amount;
    private String customerName;
    private String bankCode;
    private String customerEmail;
    private String successUrl;
    private String failUrl;
    private String dueDate;   
    private Long repairId;
    private Long customerId;

}