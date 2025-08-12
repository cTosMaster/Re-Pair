package com.example.asplatform.notify.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.asplatform.notify.domain.Notification;
import com.example.asplatform.notify.domain.Notification.ReceiverType;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop50ByReceiverIdAndReceiverTypeOrderByIdDesc(Long receiverId, ReceiverType type);

    List<Notification> findByReceiverIdAndReceiverTypeAndIdLessThanOrderByIdDesc(
            Long receiverId, ReceiverType type, Long idLessThan);

    long countByReceiverIdAndReceiverTypeAndIsReadFalse(Long receiverId, ReceiverType type);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
           update Notification n 
              set n.isRead = true 
            where n.receiverId = :receiverId 
              and n.receiverType = :type 
              and n.isRead = false
           """)
    int markAllRead(@Param("receiverId") Long receiverId, @Param("type") ReceiverType type);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from Notification n where n.createdAt < :threshold")
    int deleteOlderThan(@Param("threshold") LocalDateTime threshold);
}
