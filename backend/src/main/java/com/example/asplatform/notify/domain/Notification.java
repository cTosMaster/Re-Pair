package com.example.asplatform.notify.domain;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "notification",
    indexes = {
        @Index(
            name = "idx_notify_receiver_read_created",
            columnList = "receiverId, receiverType, isRead, createdAt"
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** users.id */
    @Column(nullable = false)
    private Long receiverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReceiverType receiverType;

    @Column(nullable = false, length = 200)
    private String title;

    /** 길이 제한: 1000자 */
    @Column(nullable = false, length = 1000)
    private String message;

    /** 자유 문자열 타입 */
    @Column(nullable = false, length = 100)
    private String type;

    @Column(nullable = false)
    private boolean isRead;

    /** KST 저장 */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    public void markAsRead() {
        this.isRead = true;
    }

    public enum ReceiverType {
        USER, CUSTOMER, ENGINEER
    }
}
