package com.example.asplatform.notify.event;

public record StatusChangedEvent(
        Long requestId,
        Long toUserId,
        String previousStatus,
        String currentStatus,
        String title,   // 미리 렌더링
        String message  // 미리 렌더링
) {}
