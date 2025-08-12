package com.example.asplatform.repair.service;

public interface RepairService {
    void startRepair(Long requestId, String engineerLoginEmail);                          // -> IN_PROGRESS
    void completeRepair(Long requestId, String engineerLoginEmail, int finalPrice, String description); // -> WAITING_FOR_PAYMENT
    void markShipped(Long requestId, String operatorLoginEmail, String trackingNo);      // -> COMPLETED
}
