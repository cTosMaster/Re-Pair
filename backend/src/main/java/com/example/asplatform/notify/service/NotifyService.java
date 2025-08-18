package com.example.asplatform.notify.service;

import com.example.asplatform.notify.dto.requestDTO.NotifyRequest;
import com.example.asplatform.notify.event.RepairRequestCreatedEvent;
import com.example.asplatform.notify.event.StatusChangedEvent;

public interface NotifyService {
  void send(NotifyRequest req);
  void sendStatusChanged(StatusChangedEvent e);
  void sendCreated(RepairRequestCreatedEvent e);
}
