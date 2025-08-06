const RepairStatusMap = {
    PENDING_APPROVAL: 1,
    WAITING_FOR_REPAIR: 2,
    IN_PROGRESS: 3,
    WAITING_FOR_PAYMENT: 4,
    WAITING_FOR_DELIVERY: 5,
    COMPLETED: 6,
    CANCELLED: 7,
};

const StepToStatusCode = {
  1: "PENDING_APPROVAL",
  2: "WAITING_FOR_REPAIR",
  3: "IN_PROGRESS",
  4: "WAITING_FOR_PAYMENT",
  5: "WAITING_FOR_DELIVERY",
  6: "COMPLETED",
  7: "CANCELLED",
};

const RepairStepLabels = [
    "접수 대기",
    "수리 대기",
    "수리 중",
    "결제 대기",
    "발송 대기",
    "발송 완료",
    "취소",
];

export { RepairStatusMap, StepToStatusCode, RepairStepLabels };