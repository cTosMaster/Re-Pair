// src/main/java/com/example/asplatform/notify/service/NotificationEventHandler.java
package com.example.asplatform.notify.service;

import org.springframework.stereotype.Component;

import com.example.asplatform.common.enums.RepairStatus;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NotificationEventHandler {

    private final NotifyService notifyService;

    /**
     * 상태 변경 시 알림 발송 (엔지니어/고객 각각 대상이 있을 때만 전송)
     * @param engineerUserId  배정된 기사 users.id (없으면 null 가능)
     * @param customerUserId  최종 사용자 users.id (null 금지 권장)
     * @param newStatus       변경된 상태
     */
    public void onStatusChanged(Long engineerUserId, Long customerUserId, RepairStatus newStatus) {
        // --- 엔지니어용(있는 경우에만) ---
        if (engineerUserId != null) {
            switch (newStatus) {
                case WAITING_FOR_REPAIR -> notifyService.notifyEngineer(
                        engineerUserId, "새 작업 요청", "새로운 수리 요청이 배정되었습니다.", "request.assigned");
                case IN_PROGRESS -> notifyService.notifyEngineer(
                        engineerUserId, "수리 시작", "수리를 시작했습니다.", "status.repairing");
                case WAITING_FOR_PAYMENT -> notifyService.notifyEngineer(
                        engineerUserId, "수리 완료 보고", "최종 견적 입력 완료, 결제 대기 상태입니다.", "status.waiting_payment");
                case COMPLETED -> notifyService.notifyEngineer(
                        engineerUserId, "배송/처리 완료", "고객에게 발송 완료되었습니다.", "shipment.delivered");
                default -> {}
            }
        }

        // --- 고객용(있는 경우에만) ---
        if (customerUserId != null) {
            switch (newStatus) {
                case WAITING_FOR_REPAIR -> notifyService.notifyCustomer(
                        customerUserId, "접수 완료", "수리 요청이 접수되어 담당자가 배정되었습니다.", "request.accepted");
                case IN_PROGRESS -> notifyService.notifyCustomer(
                        customerUserId, "수리 시작", "수리가 시작되었습니다.", "status.repairing");
                case WAITING_FOR_PAYMENT -> notifyService.notifyCustomer(
                        customerUserId, "수리 완료", "최종 견적이 등록되었습니다. 결제를 진행해 주세요.", "status.completed");
                case COMPLETED -> notifyService.notifyCustomer(
                        customerUserId, "배송 완료", "제품 발송이 완료되었습니다. 이용해 주셔서 감사합니다.", "shipment.delivered");
                case CANCELED -> notifyService.notifyCustomer(
                        customerUserId, "접수 반려/취소", "수리가 진행되지 않았습니다. 상세 사유를 확인해 주세요.", "request.rejected");
                default -> {}
            }
        }
    }
}
