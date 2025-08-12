package com.example.asplatform.notify.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.notify.domain.Notification;
import com.example.asplatform.notify.dto.responseDTO.NotificationResponseDTO;
import com.example.asplatform.notify.service.NotifyService;
import com.example.asplatform.user.domain.User;
import com.example.asplatform.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notify")
public class NotifyController {

    private final NotifyService notifyService;
    private final UserRepository userRepository;

    /** 내부 공통: USER 역할이면 CUSTOMER로 매핑 */
    private Notification.ReceiverType inferType(User self, Notification.ReceiverType typeParam) {
    if (typeParam != null) return typeParam;
    return switch (self.getRole().name()) {
        case "USER" -> Notification.ReceiverType.USER;
        case "CUSTOMER" -> Notification.ReceiverType.CUSTOMER;
        case "ENGINEER" -> Notification.ReceiverType.ENGINEER;
        case "ADMIN" -> throw new org.springframework.web.server.ResponseStatusException(
                            org.springframework.http.HttpStatus.BAD_REQUEST, "ADMIN은 type을 명시하세요.");
        default -> throw new IllegalStateException("Unknown role");
    };
}

    /** 알림 목록 조회 (본인 것만, 무한 스크롤) */
    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> list(
            @AuthenticationPrincipal UserDetails me,
            @RequestParam(required = false) Long afterId,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) Notification.ReceiverType type
    ) {
        User self = userRepository.findByEmail(me.getUsername()).orElseThrow();
        Notification.ReceiverType rType = inferType(self, type);
        return ResponseEntity.ok(
                notifyService.getNotificationsByUser(self.getId(), rType, afterId, limit)
        );
    }

    /** 미읽음 개수 */
    @GetMapping("/unread-count")
    public ResponseEntity<Long> unreadCount(@AuthenticationPrincipal UserDetails me,
                                            @RequestParam(required = false) Notification.ReceiverType type) {
        User self = userRepository.findByEmail(me.getUsername()).orElseThrow();
        Notification.ReceiverType rType = inferType(self, type);
        return ResponseEntity.ok(notifyService.getUnreadCount(self.getId(), rType));
    }

    /** 전체 읽음 처리 */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> readAll(@AuthenticationPrincipal UserDetails me,
                                        @RequestParam(required = false) Notification.ReceiverType type) {
        User self = userRepository.findByEmail(me.getUsername()).orElseThrow();
        Notification.ReceiverType rType = inferType(self, type);
        notifyService.markAllRead(self.getId(), rType);
        return ResponseEntity.noContent().build();
    }

    /** 알림 읽음 처리 (본인 소유만 허용) */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> read(
            @AuthenticationPrincipal UserDetails me,
            @PathVariable Long id
    ) {
        User self = userRepository.findByEmail(me.getUsername()).orElseThrow();
        notifyService.markAsRead(id, self.getId());
        return ResponseEntity.ok().build();
    }

    /** (내부 테스트용) 단건 생성 – 실제 운영은 서비스 계층 Hook 사용 권장 */
    @PostMapping("/internal")
    public ResponseEntity<Void> create(
            @AuthenticationPrincipal UserDetails me,
            @RequestParam Long receiverId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam String type,
            @RequestParam Notification.ReceiverType receiverType
    ) {
        notifyService.sendNotification(receiverId, title, message, type, receiverType);
        return ResponseEntity.ok().build();
    }
    
}
