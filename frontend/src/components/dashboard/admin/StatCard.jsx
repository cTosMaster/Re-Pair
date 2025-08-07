
export default function StatCard({ title, value, color = 'gray' }) {
  const colorMap = {
    green: 'text-green-600',
    yellow: 'text-yellow-500',
    red: 'text-red-500',
    blue: 'text-blue-500',
    gray: 'text-gray-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">{title}</h2>
      <p className={`text-3xl font-bold ${colorMap[color] || colorMap.gray}`}>{value}</p>
    </div>
  );
}
