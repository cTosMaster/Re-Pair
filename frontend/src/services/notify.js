import axios from "./api"; // 기존 Axios 설정

/** 본인 알림 목록 조회 */
export const getNotifications = async (limit = 20) =>
  axios.get(`/notify?limit=${limit}`).then(res => res.data);

/** 본인 미읽음 개수 */
export const getUnreadCount = async () =>
  axios.get("/notify/unread-count").then(res => res.data);

/** 본인 알림 모두 읽음 */
export const markAllRead = async () =>
  axios.patch("/notify/read-all");
