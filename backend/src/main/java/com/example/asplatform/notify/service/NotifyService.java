package com.example.asplatform.notify.service;

import java.util.List;

import com.example.asplatform.notify.domain.Notification;
import com.example.asplatform.notify.domain.Notification.ReceiverType;
import com.example.asplatform.notify.dto.responseDTO.NotificationResponseDTO;

public interface NotifyService {

    List<NotificationResponseDTO> getNotificationsByUser(Long userId, ReceiverType type, Long afterId, int limit);

    long getUnreadCount(Long userId, ReceiverType type);

    void markAllRead(Long userId, ReceiverType type);

    void markAsRead(Long id, Long ownerUserId);

    Notification sendNotification(Long receiverId, String title, String message, String type, ReceiverType rType);

    void notifyEngineer(Long engineerUserId, String title, String message, String eventType);

    void notifyCustomer(Long customerUserId, String title, String message, String eventType);

    
}
