package com.example.asplatform.notify.dto.requestDTO;

import com.example.asplatform.notify.domain.ReceiverType;

import java.util.Map;

public record NotifyRequest(
        Long toUserId,
        ReceiverType receiverType, // USER/CUSTOMER/ENGINEER
        String title,
        String message,
        String type,               // 기본 "repair.status.changed"
        Map<String, Object> metadata // 필요 시 메시지에 포함해서 사용 (DB 저장 X)
) {}
