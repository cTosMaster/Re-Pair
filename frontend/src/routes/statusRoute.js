export const fromApiToUi = (apiCode) =>
  ({
    PENDING: "PENDING_APPROVAL",
    WAITING_FOR_REPAIR: "WAITING_FOR_REPAIR",
    IN_PROGRESS: "IN_PROGRESS",
    WAITING_FOR_PAYMENT: "WAITING_FOR_PAYMENT",
    WAITING_FOR_DELIVERY: "WAITING_FOR_DELIVERY",
    COMPLETED: "COMPLETED",
    CANCELED: "CANCELLED",
  }[apiCode] ?? apiCode);

// 백엔드가 한글 상태를 줄 때 (대시보드 목록 응답 등)
export const fromKoToUi = (ko) =>
  ({
    접수대기: "PENDING_APPROVAL",
    수리대기: "WAITING_FOR_REPAIR",
    수리중: "IN_PROGRESS",
    결제대기: "WAITING_FOR_PAYMENT",
    배송대기: "WAITING_FOR_DELIVERY",
    완료: "COMPLETED",
    취소: "CANCELLED",
  }[ko] ?? "PENDING_APPROVAL");

// UI 상태 → 라우트 세그먼트
export const segmentForStatus = (uiCode) =>
  ({
    PENDING_APPROVAL: "pending-approval",
    WAITING_FOR_REPAIR: "waiting-for-repair",
    IN_PROGRESS: "in-progress",
    WAITING_FOR_PAYMENT: "waiting-for-payment",
    WAITING_FOR_DELIVERY: "waiting-for-delivery",
    COMPLETED: "completed",
    // 취소는 사유 표시가 있는 pending-approval 화면으로 안내
    CANCELLED: "pending-approval",
  }[uiCode] ?? "pending-approval");