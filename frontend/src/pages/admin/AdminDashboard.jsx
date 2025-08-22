import { useEffect, useState } from 'react';
import StatCard from '../../components/dashboard/admin/StatCard';
import RecentActivity from '../../components/dashboard/admin/RecentActivity';
import PendingCompanyList from '../../components/dashboard/admin/PendingCompanyList';
import { getCustomers } from '../../services/adminAPI';

export default function AdminDashboard() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // 최근 승인 고객사 목록 가져오기
        const res = await getCustomers({
          status: 'APPROVED',
          page: 0,
          size: 5,
          sort: 'approvedAt,desc',
        });
        const list = res?.data?.content ?? [];
        const msgs = list.map(c => {
          const name = c.companyName ?? c.name;
          const date = c.approvedAt
            ? new Date(c.approvedAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })
            : '-';
          return `✔️ ${name} 승인됨 (${date})`;
        });
        setActivities(msgs);
      } catch {
        setActivities(['최근 활동을 불러오지 못했습니다.']);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">플랫폼 관리자 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="총 가입 고객사 수" value={128} color="green" />
        <StatCard title="승인 대기 고객사" value={5} color="yellow" />
        <RecentActivity activities={activities} />
      </div>

      <PendingCompanyList />
    </div>
  );
}