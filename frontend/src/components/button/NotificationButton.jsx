import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { getNotifications, getUnreadCount, markAllRead } from "../../services/notify";

export default function NotificationButton() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const toggleDropdown = async () => {
    setOpen(prev => !prev);
    if (!open) {
      setNotifications(await getNotifications());
      setUnread(await getUnreadCount());
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    const fetchUnread = async () => setUnread(await getUnreadCount());
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const badge = unread > 9 ? "9+" : unread;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="알림"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold text-white text-center rounded-full bg-red-500">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lg z-50">
          <div className="flex justify-between items-center p-3 border-b border-gray-100">
            <span className="font-semibold text-gray-700">알림</span>
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
                className={`p-3 last:rounded-b-xl ${
                  n.read ? "" : "font-semibold bg-gray-50"
                }`}
              >
                <div className="text-gray-800">{n.title}</div>
                <div className="text-gray-500 text-sm mt-0.5">{n.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
