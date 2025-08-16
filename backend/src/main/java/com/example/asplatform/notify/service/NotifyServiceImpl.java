package com.example.asplatform.notify.service;

import com.example.asplatform.notify.domain.Notification;
import com.example.asplatform.notify.domain.ReceiverType;
import com.example.asplatform.notify.dto.requestDTO.NotifyRequest;
import com.example.asplatform.notify.event.*;
import com.example.asplatform.notify.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class NotifyServiceImpl implements NotifyService {
  private final NotificationRepository repo;

  @Override
  @org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
  public void send(NotifyRequest req) {
    var saved = repo.saveAndFlush(
        Notification.of(
            req.toUserId(),
            req.receiverType() != null ? req.receiverType() : ReceiverType.USER,
            req.title(), req.message(),
            req.type() != null ? req.type() : "notify.custom"
        )
    );
    log.info("[NOTIFY][CUSTOM] saved id={} to={} type={}", saved.getId(), saved.getReceiverId(), saved.getType());
  }

  @Override
  @org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
  public void sendCreated(RepairRequestCreatedEvent e) {
    var saved = repo.saveAndFlush(
        Notification.of(e.toUserId(), ReceiverType.USER, e.title(), e.message(), "repair.request.created")
    );
    log.info("[NOTIFY][CREATED] saved id={} to={}", saved.getId(), saved.getReceiverId());
  }

  @Override
  @org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
  public void sendStatusChanged(StatusChangedEvent e) {
    var type = switch (e.currentStatus()) {
      case "WAITING_FOR_REPAIR"   -> "repair.status.waiting_for_repair";
      case "IN_PROGRESS"          -> "repair.status.in_progress";
      case "WAITING_FOR_PAYMENT"  -> "repair.status.waiting_for_payment";
      case "WAITING_FOR_DELIVERY" -> "repair.status.waiting_for_delivery";
      case "COMPLETED"            -> "repair.status.completed";
      case "CANCELED"             -> "repair.status.canceled";
      case "PENDING"              -> "repair.request.created";
      default                     -> "repair.status.changed";
    };
    var saved = repo.saveAndFlush(
        Notification.of(e.toUserId(), ReceiverType.USER, e.title(), e.message(), type)
    );
    log.info("[NOTIFY][STATUS] saved id={} req={} {}->{} to={} type={}",
        saved.getId(), e.requestId(), e.previousStatus(), e.currentStatus(), e.toUserId(), type);
  }

}