export const dummyUser = {
  role: "USER", // "USER" | "CUSTOMER" | "ENGINEER" | "ADMIN"
  repair: {
    statusCode: "COMPLETED",
    // PENDING_APPROVAL: 1,
    // WAITING_FOR_REPAIR: 2,
    // IN_PROGRESS: 3,
    // WAITING_FOR_PAYMENT: 4,
    // WAITING_FOR_DELIVERY: 5,
    // COMPLETED: 6,
    // CANCELLED: 7,
    isCancelled: false,                // 취소 여부
  },
};