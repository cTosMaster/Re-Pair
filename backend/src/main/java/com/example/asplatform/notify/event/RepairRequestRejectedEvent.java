package com.example.asplatform.notify.event;

public record RepairRequestRejectedEvent(
        Long requestId,
        Long toUserId,
        String reason,   // 반려 사유
        String title,
        String message
) {}
