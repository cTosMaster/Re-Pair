import { Bell } from "lucide-react";

export default function NotificationButton({ count = 0, onClick }) {
  const badge = count > 9 ? "9+" : String(count);
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-100"
      aria-label="알림"
    >
      <Bell size={20} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 text-[10px] leading-4 text-white text-center rounded-full bg-red-500">
          {badge}
        </span>
      )}
    </button>
  );
}