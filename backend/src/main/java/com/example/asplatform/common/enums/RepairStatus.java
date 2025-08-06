package com.example.asplatform.common.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum RepairStatus {
    PENDING("접수대기"),
    WAITING_FOR_REPAIR("수리대기"),
    IN_PROGRESS("수리중"),
    WAITING_FOR_PAYMENT("결제대기"),
    WAITING_FOR_DELIVERY("배송대기"),
    COMPLETED("완료"),
    CANCELED("취소");
	
	private final String label; //한글 라벨
	
}
