package com.example.asplatform.repairRequest.service;

public interface RepairRequestService {
    void accept(Long requestId, Long engineerUserId);          // PENDING -> WAITING_FOR_REPAIR (+배정)
    void reject(Long requestId, String reason);                // ANY -> CANCELED
    void assignEngineer(Long requestId, Long engineerUserId);  // 배정/재배정(+PENDING이면 WAITING_FOR_REPAIR)
    default void reject(Long requestId) {
    reject(requestId, null);
}
}
