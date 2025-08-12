package com.example.asplatform.notify.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.asplatform.notify.domain.Notification;
import com.example.asplatform.notify.domain.Notification.ReceiverType;
import com.example.asplatform.notify.dto.responseDTO.NotificationResponseDTO;
import com.example.asplatform.notify.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotifyServiceImpl implements NotifyService {

    private final NotificationRepository repo;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getNotificationsByUser(Long userId, ReceiverType type, Long afterId, int limit) {
        List<Notification> list = (afterId == null)
                ? repo.findTop50ByReceiverIdAndReceiverTypeOrderByIdDesc(userId, type)
                : repo.findByReceiverIdAndReceiverTypeAndIdLessThanOrderByIdDesc(userId, type, afterId);

        return list.stream()
                .limit(limit)
                .map(NotificationResponseDTO::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId, ReceiverType type) {
        return repo.countByReceiverIdAndReceiverTypeAndIsReadFalse(userId, type);
    }

    @Override
    public void markAllRead(Long userId, ReceiverType type) {
        repo.markAllRead(userId, type);
    }

    @Override
    public void markAsRead(Long id, Long ownerUserId) {
        Notification n = repo.findById(id).orElseThrow();
        if (!n.getReceiverId().equals(ownerUserId)) {
            throw new SecurityException("권한 없음");
        }
        n.markAsRead();
    }

    @Override
    public Notification sendNotification(Long receiverId, String title, String message, String type, ReceiverType rType) {
        Notification n = Notification.builder()
                .receiverId(receiverId)
                .receiverType(rType)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .createdAt(LocalDateTime.now(ZoneId.of("Asia/Seoul")))
                .build();
        return repo.save(n);
    }

    @Override
    public void notifyEngineer(Long engineerUserId, String title, String message, String eventType) {
        sendNotification(engineerUserId, title, message, eventType, ReceiverType.ENGINEER);
    }

    @Override
    public void notifyCustomer(Long customerUserId, String title, String message, String eventType) {
    
    sendNotification(customerUserId, title, message, eventType, ReceiverType.USER); // ✅ 최종 사용자 = USER
}
}
