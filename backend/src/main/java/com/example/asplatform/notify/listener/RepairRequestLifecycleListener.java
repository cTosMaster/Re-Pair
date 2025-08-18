// src/main/java/com/example/asplatform/notify/listener/RepairRequestLifecycleListener.java
package com.example.asplatform.notify.listener;

import com.example.asplatform.notify.event.*;
import com.example.asplatform.notify.service.NotifyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.context.event.EventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class RepairRequestLifecycleListener {
  private final NotifyService notifyService;

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onCreated(RepairRequestCreatedEvent e) {
    log.info("[NOTIFY] Created req={} toUser={}", e.requestId(), e.toUserId());
    notifyService.sendCreated(e);
  }

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onStatus(StatusChangedEvent e) {
    log.info("[NOTIFY] StatusChanged req={} {}->{} toUser={}",
        e.requestId(), e.previousStatus(), e.currentStatus(), e.toUserId());
    notifyService.sendStatusChanged(e);
  }

  // 🔎 임시 진단용: 트랜잭션과 무관하게 이벤트를 받는지 확인
  @EventListener
  public void onStatusImmediate(StatusChangedEvent e) {
    log.info("[NOTIFY][IMM] (no-tx) req={} {}->{} toUser={}",
        e.requestId(), e.previousStatus(), e.currentStatus(), e.toUserId());
  }
}
