package com.example.asplatform.repairRequest.dto.responseDTO;

import java.util.List;

public record DeleteRepairRequestsResponseDto(int deletedCount, List<Long> skippedIds, String message) {
}
