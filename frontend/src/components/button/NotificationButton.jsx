import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { getNotifications, getUnreadCount, markAllRead } from "../../services/notify";

export default function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  // 드롭다운 토글
  const toggleDropdown = async () => {
    setOpen(prev => !prev);
    if (!open) {
      const notis = await getNotifications();
      setNotifications(notis);
      const count = await getUnreadCount();
      setUnread(count);
    }
  };

  // 모두 읽음
  const handleMarkAllRead = async () => {
    await markAllRead();
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // 주기적으로 미읽음 개수 업데이트
  useEffect(() => {
    const fetchUnread = async () => {
      const count = await getUnreadCount();
      setUnread(count);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000); // 10초마다
    return () => clearInterval(interval);
  }, []);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const badge = unread > 9 ? "9+" : unread;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100"
        aria-label="알림"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 text-[10px] leading-4 text-white text-center rounded-full bg-red-500">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border rounded-xl shadow-lg z-50">
          <div className="flex justify-between items-center p-2 border-b">
            <span className="font-medium">알림</span>
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-blue-600 hover:underline"
            >
              모두 읽음
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              새로운 알림이 없습니다.
            </div>
          ) : (
            notifications.map(n => (
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
