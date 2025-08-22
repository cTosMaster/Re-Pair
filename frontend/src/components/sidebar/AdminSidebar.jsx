// 플랫폼 관리자용 사이드바 컴포넌트

import { NavLink } from 'react-router-dom';
import { ShieldCheck, Users, Home, Settings } from 'lucide-react';

const menuItems = [
  { label: '고객사 승인관리', icon: <ShieldCheck size={16} />, path: '/admin/dash' },
  { label: '계정 관리', icon: <Users size={16} />, path: '/admin/dash/account' },
  { label: '고객 센터관리', icon: <Home size={16} />, path: '/admin/dash/centers' },
  { label: '카테고리 관리', icon: <Settings size={16} />, path: '/admin/dash/categories' },
];

export default function AdminSidebar() {
  return (
    <aside className="w-60 bg-white shadow-md p-6 space-y-6 hidden lg:block">
      <nav className="space-y-2 text-sm">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin/dash'}   // ✅ 루트 메뉴만 정확히 일치할 때만 활성화
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition font-medium hover:bg-gray-100 ${isActive ? 'bg-green-100 text-green-800' : 'text-gray-700'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
