package com.example.asplatform.common.enums;

import java.util.Set;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
public enum RepairStatus {
	PENDING("접수대기"),
	WAITING_FOR_REPAIR("수리대기"),
	IN_PROGRESS("수리중"),
	WAITING_FOR_PAYMENT("결제대기"),
	WAITING_FOR_DELIVERY("배송대기"),
	COMPLETED("완료", Set.of(Role.CUSTOMER)),      // 고객사 관리자만 수동 가능
    CANCELED("취소", Set.of(Role.CUSTOMER, Role.ENGINEER)); // 고객사 관리자/기사 수동 가능
	
	private final String label; //한글 라벨
	private final Set<Role> manuallyAllowedRoles;

    RepairStatus(String label) {
        this(label, Set.of()); // 기본은 수동 변경 불가
    }

    RepairStatus(String label, Set<Role> manuallyAllowedRoles) {
        this.label = label;
        this.manuallyAllowedRoles = manuallyAllowedRoles;
    }

    public boolean canManuallyChange(Role role) {
        return manuallyAllowedRoles.contains(role);
    }
	
	
}
