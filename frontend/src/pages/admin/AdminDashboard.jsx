import StatCard from '../../components/dashboard/admin/StatCard';
import RecentActivity from '../../components/dashboard/admin/RecentActivity';
import CategorySummary from '../../components/dashboard/admin/CategorySummary';
import PendingCompanyList from '../../components/dashboard/admin/PendingCompanyList';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">플랫폼 관리자 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="총 가입 고객사 수" value={128} color="green" />
        <StatCard title="승인 대기 고객사" value={5} color="yellow" />

        <RecentActivity
          activities={[
            '✔️ ABC전자 승인됨 (3시간 전)',
            '✔️ 굿서비스코리아 승인됨 (어제)',
            '❌ 수리나라 승인 거절됨 (2일 전)',
          ]}
        />

        <CategorySummary
          summary={[
            { label: '전자기기', count: 32 },
            { label: '가전제품', count: 21 },
            { label: '기타', count: 8 },
          ]}
        />
      </div>

      <PendingCompanyList />
    </div>
  );
}
