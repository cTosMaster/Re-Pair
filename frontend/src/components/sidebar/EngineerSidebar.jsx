import { NavLink } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const menuItems = [
  { label: '수리 현황', icon: <Wrench size={16} />, path: '/engineer/dash' },
];

export default function EngineerSidebar() {
  return (
    <aside className="w-60 bg-white shadow-md p-6 space-y-6">
      <nav className="space-y-2 text-sm">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/engineer/dash'} // ✅ 루트 탭만 정확히 일치할 때 활성화
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition font-medium
               ${isActive ? 'bg-green-300/60 text-black' : 'text-gray-800 hover:bg-gray-100'}`
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