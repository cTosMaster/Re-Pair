export default function RecentActivity({ activities = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">최근 승인 활동</h2>
      <ul className="text-sm text-gray-600 space-y-1">
        {activities.length === 0 ? (
          <li className="text-gray-400">최근 활동이 없습니다.</li>
        ) : (
          activities.map((activity, idx) => <li key={idx}>{activity}</li>)
        )}
      </ul>
    </div>
  );
}
