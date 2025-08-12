import { Outlet } from 'react-router-dom';
import Header from './Header';
import AdminSidebar from '../components/sidebar/AdminSidebar';
import UserSidebar from '../components/sidebar/UserSidebar';
import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext'; // or import { useAuth } from '../hooks/useAuth'

export default function DashboardLayout({ force = 'auto' }) {
  const { user, loading } = useContext(AuthContext); // useAuth() 써도 동일
  const role = (user?.role || '').toUpperCase();

  // 사이드바 결정: force가 'admin'/'user'면 강제, 아니면 role로 자동
  const Sidebar = useMemo(() => {
    if (force === 'admin') return AdminSidebar;
    if (force === 'user') return UserSidebar;
    return role === 'ADMIN' ? AdminSidebar : UserSidebar;
  }, [force, role]);

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