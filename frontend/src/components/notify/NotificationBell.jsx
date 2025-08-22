import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react"; // 아이콘
import axios from "axios";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  // 알림 목록 가져오기
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notify?limit=20");
      setNotifications(res.data);
    } catch (err) {
      console.error("알림 불러오기 실패", err);
    }
  };

  // 안 읽은 개수 가져오기
  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get("/api/notify/unread-count");
      setUnreadCount(res.data);
    } catch (err) {
      console.error("unread count 가져오기 실패", err);
    }
  };

  // 전체 읽음 처리
  const markAllRead = async () => {
    try {
      await axios.patch("/api/notify/read-all");
      setUnreadCount(0);
      // 목록에서도 읽음 반영
      setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("읽음 처리 실패", err);
    }
  };

  // 드롭다운 토글
  const toggleDropdown = () => {
    setOpen((prev) => !prev);
    if (!open) {
      fetchNotifications();
      fetchUnreadCount();
    }
  };

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* 종 아이콘 + 뱃지 */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 알림 드롭다운 */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded-xl shadow-lg z-50">
          <div className="flex justify-between items-center p-2 border-b">
            <span className="font-medium">알림</span>
            <button
              onClick={markAllRead}
              className="text-sm text-blue-600 hover:underline"
            >
              모두 읽음
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              새로운 알림이 없습니다
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 text-sm border-b last:border-0 ${
                  n.read ? "bg-white" : "bg-gray-50 font-semibold"
                }`}
              >
                <div className="text-gray-800">{n.title}</div>
                <div className="text-gray-500 text-xs">{n.message}</div>
                <div className="text-gray-400 text-[10px] mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
