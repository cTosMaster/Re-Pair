import { Outlet } from 'react-router-dom';
import Header from './Header';
import AdminSidebar from '../components/sidebar/AdminSidebar';
import UserSidebar from '../components/sidebar/UserSidebar';
import EngineerSidebar from '../components/sidebar/EngineerSidebar'; // ✅ 추가
import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext'; // 또는 useAuth 훅 사용 가능

export default function DashboardLayout({ force = 'auto' }) {
  const { user, loading } = useContext(AuthContext);
  const role = (user?.role || '').toUpperCase();
  const forced = (force || 'auto').toString().toLowerCase();

  // 사이드바 결정: force가 'admin' | 'engineer' | 'user'면 강제, 아니면 role로 자동
  const Sidebar = useMemo(() => {
    if (forced === 'admin') return AdminSidebar;
    if (forced === 'engineer') return EngineerSidebar; // ✅ 강제 엔지니어
    if (forced === 'user') return UserSidebar;

    switch (role) {
      case 'ADMIN':
        return AdminSidebar;
      case 'ENGINEER': // ✅ 엔지니어 롤 자동 매칭
        return EngineerSidebar;
      // USER, CUSTOMER 등은 기본 사용자 사이드바로
      default:
        return UserSidebar;
    }
  }, [forced, role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex flex-1">
          <aside className="w-60 bg-white shadow-md p-6 hidden lg:block">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="mt-3 h-8 w-full bg-gray-200 rounded animate-pulse" />
          </aside>
          <main className="flex-1 p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}