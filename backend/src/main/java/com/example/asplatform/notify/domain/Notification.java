package com.example.asplatform.notify.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "notification")
public class Notification {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "receiver_id", nullable = false)
  private Long receiverId;

  @Enumerated(EnumType.STRING)
  @Column(name = "receiver_type", nullable = false, length = 20)
  private ReceiverType receiverType;

  @Column(nullable = false, length = 255)
  private String title;

  @Column(nullable = false, columnDefinition = "TEXT")
  private String message;

  @Column(name = "type", nullable = false, length = 100)
  private String type;

  @Column(name = "is_read", nullable = false)
  private boolean read = false;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  // getters/setters 생략 가능 (롬복 쓰면 @Getter/@Setter 추가)
  public static Notification of(Long toUserId, ReceiverType rtype, String title, String msg, String type) {
    Notification n = new Notification();
    n.receiverId = toUserId;
    n.receiverType = rtype;
    n.title = title;
    n.message = msg;
    n.type = (type == null || type.isBlank()) ? "repair.status.changed" : type;
    return n;
  }
}
