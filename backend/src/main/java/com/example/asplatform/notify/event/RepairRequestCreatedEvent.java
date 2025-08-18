package com.example.asplatform.notify.event;

public record RepairRequestCreatedEvent(
  Long requestId,
  Long toUserId,
  String title,
  String message
) {}
