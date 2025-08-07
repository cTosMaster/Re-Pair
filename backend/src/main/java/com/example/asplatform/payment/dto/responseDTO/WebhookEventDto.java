package com.example.asplatform.payment.dto.responseDTO;

import lombok.Data;

@Data
public class WebhookEventDto {
    private String eventType;
    private WebhookEventData data;
}
