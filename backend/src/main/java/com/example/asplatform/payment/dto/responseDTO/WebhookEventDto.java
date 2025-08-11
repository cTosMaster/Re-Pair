package com.example.asplatform.payment.dto.responseDTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class WebhookEventDto {
    @JsonProperty("eventType")
    private String eventType;

    @JsonProperty("data")
    private WebhookEventData data;
}