package com.example.asplatform.common.enums;

public enum RepairStatus {
    PENDING,                 // 접수대기
    WAITING_FOR_REPAIR,      // 수리대기(접수+배정 완료)
    IN_PROGRESS,             // 수리중
    WAITING_FOR_PAYMENT,     // 결제대기(최종 견적 입력)
    WAITING_FOR_DELIVERY,    // 발송대기(결제 완료 후)
    COMPLETED,               // 처리완료(발송 완료)
    CANCELED                 // 취소
}