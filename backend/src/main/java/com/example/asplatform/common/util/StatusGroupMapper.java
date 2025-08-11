package com.example.asplatform.common.util;

import com.example.asplatform.common.enums.RepairStatus;
import com.example.asplatform.common.enums.StatusGroup;

// 상태그룹(StatusGroup) 매핑 유틸
public class StatusGroupMapper {
    public static StatusGroup toGroup(RepairStatus status) {
        if (StatusGroup.IN_PROGRESS.getStatusSet().contains(status)) return StatusGroup.IN_PROGRESS;
        if (StatusGroup.COMPLETED.getStatusSet().contains(status)) return StatusGroup.COMPLETED;
        throw new IllegalArgumentException("Unknown status: " + status);
    }
}
