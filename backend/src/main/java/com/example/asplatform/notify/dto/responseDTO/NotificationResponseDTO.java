package com.example.asplatform.notify.dto.responseDTO;

import java.time.format.DateTimeFormatter;

import com.example.asplatform.notify.domain.Notification;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class NotificationResponseDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private String createdAt;   // ISO 문자열 (KST)
    private String receiverType;

    public static NotificationResponseDTO from(Notification n) {
        return NotificationResponseDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .createdAt(n.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .receiverType(n.getReceiverType().name())
                .build();
    }
}
