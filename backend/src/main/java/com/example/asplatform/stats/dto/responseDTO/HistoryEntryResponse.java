package com.example.asplatform.stats.dto.responseDTO;

public record HistoryEntryResponse(
        Long historyId,
        Long requestId,
        Long changedBy,
        String previousStatus,
        String newStatus,
        String changedAt,
        String memo
) {}
