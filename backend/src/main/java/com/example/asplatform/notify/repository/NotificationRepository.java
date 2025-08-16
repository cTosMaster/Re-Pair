package com.example.asplatform.notify.repository;

import com.example.asplatform.notify.domain.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findTop100ByReceiverIdOrderByCreatedAtDesc(Long receiverId);

    long countByReceiverIdAndReadIsFalse(Long receiverId);

    @Modifying
    @Query("update Notification n set n.read = true where n.receiverId = :userId and n.read = false")
    int markAllRead(@Param("userId") Long userId);
}
