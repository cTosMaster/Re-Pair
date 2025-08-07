package com.example.asplatform.payment.dto.responseDTO;

import lombok.Data;

@Data
public class WebhookEventData {
    private String orderId;
    private String status;
    private String paymentKey;
    private String transactionKey;
    private String approvedAt;
}
