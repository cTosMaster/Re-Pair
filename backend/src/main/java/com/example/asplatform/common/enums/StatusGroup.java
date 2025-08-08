package com.example.asplatform.common.enums;

import java.util.EnumSet;
import java.util.Set;

import lombok.Getter;

//RepairStatus를 그룹으로 묶음 (요청 조회 시 사용)
@Getter
public enum StatusGroup {

    IN_PROGRESS("진행 중",EnumSet.of(
        RepairStatus.PENDING,
        RepairStatus.WAITING_FOR_REPAIR,
        RepairStatus.IN_PROGRESS,
        RepairStatus.WAITING_FOR_PAYMENT,
        RepairStatus.WAITING_FOR_DELIVERY
    )),
    COMPLETED("처리 완료", EnumSet.of(  // 완료 + 취소 포함
            RepairStatus.COMPLETED,
            RepairStatus.CANCELED
    ));

	private final String label; 
    private final Set<RepairStatus> statusSet;

    StatusGroup(String label, Set<RepairStatus> statusSet) {
    	this.label = label;
        this.statusSet = statusSet;
    }

    public Set<RepairStatus> toStatusSet() { // JPQL조회 시 IN조건으로 활용
        return this.statusSet;
    }
}