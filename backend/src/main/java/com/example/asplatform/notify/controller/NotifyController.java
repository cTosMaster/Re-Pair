package com.example.asplatform.notify.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.asplatform.auth.service.CustomUserDetails;
import com.example.asplatform.notify.domain.Notification;
import com.example.asplatform.notify.dto.requestDTO.NotifyRequest;
import com.example.asplatform.notify.repository.NotificationRepository;
import com.example.asplatform.notify.service.NotifyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notify")
@RequiredArgsConstructor
public class NotifyController {

    private final NotifyService notifyService;
    // 🔽 조회/읽음 처리를 위해 레포지토리만 주입 (새 서비스 안 만듦)
    private final NotificationRepository repo;

    // POST /api/notify/status-update  (기존 그대로)
    @PostMapping("/status-update")
    public ResponseEntity<Void> statusUpdate(@RequestBody NotifyRequest req) {
        notifyService.send(req);
        return ResponseEntity.accepted().build();
    }

    // ✅ GET /api/notify  — 본인 알림 목록 (userId 파라미터 필요 없음)
    @GetMapping
    public List<Notification> list(@AuthenticationPrincipal CustomUserDetails me,
                                   @RequestParam(defaultValue = "20") int limit) {
        var base = repo.findTop100ByReceiverIdOrderByCreatedAtDesc(me.getId());
        return base.size() > limit ? base.subList(0, limit) : base;
    }

    // ✅ GET /api/notify/unread-count — 본인 미읽음 개수
    @GetMapping("/unread-count")
    public long unreadCount(@AuthenticationPrincipal CustomUserDetails me) {
        return repo.countByReceiverIdAndReadIsFalse(me.getId());
    }

    // ✅ PATCH /api/notify/read-all — 본인 알림 일괄 읽음
    @PatchMapping("/read-all")
    @Transactional
    public ResponseEntity<Void> readAll(@AuthenticationPrincipal CustomUserDetails me) {
        repo.markAllRead(me.getId());
        return ResponseEntity.noContent().build();
    }

    // (선택) PATCH 막힌 환경 대비: POST도 지원
    @PostMapping("/read-all")
    @Transactional
    public ResponseEntity<Void> readAllPost(@AuthenticationPrincipal CustomUserDetails me) {
        return readAll(me);
    }
}
