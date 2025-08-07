package com.example.asplatform.payment.dto.responseDTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class WebhookEventData {
    @JsonProperty("orderId")
    private String orderId;

    @JsonProperty("status")
    private String status;

    @JsonProperty("paymentKey")
    private String paymentKey;

    @JsonProperty("transactionKey")
    private String transactionKey;

    @JsonProperty("approvedAt")
    private String approvedAt;
}
