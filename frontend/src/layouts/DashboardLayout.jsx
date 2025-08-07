import { Outlet } from 'react-router-dom';
import Header from './Header';
import AdminSidebar from '../components/sidebar/AdminSidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ✅ 상단 헤더 */}
      <Header />

      {/* ✅ 본문: 헤더 아래에 좌측 사이드바 + 내용 */}
      <div className="flex flex-1">
        <AdminSidebar />

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
