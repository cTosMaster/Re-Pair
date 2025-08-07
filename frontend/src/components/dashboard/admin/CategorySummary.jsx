
export default function CategorySummary({ summary = [] }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">카테고리별 요청 통계</h2>
      <ul className="text-sm text-gray-600 space-y-1">
        {summary.length === 0 ? (
          <li className="text-gray-400">데이터 없음</li>
        ) : (
          summary.map((item, idx) => (
            <li key={idx}>
              {item.label} - <span className="font-medium">{item.count}건</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}