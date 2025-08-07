
const dummyCompanies = [
  { id: 1, name: 'ABC전자', email: 'abc@repair.com', requestedAt: '2025-08-01' },
  { id: 2, name: '굿서비스코리아', email: 'good@repair.com', requestedAt: '2025-08-03' },
  { id: 3, name: '수리나라', email: 'fix@repair.com', requestedAt: '2025-08-06' },
];

export default function PendingCompanyList() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">승인 대기 고객사 목록</h2>
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-500 border-b">
          <tr>
            <th className="py-2">회사명</th>
            <th className="py-2">이메일</th>
            <th className="py-2">요청일</th>
            <th className="py-2 text-right">액션</th>
          </tr>
        </thead>
        <tbody>
          {dummyCompanies.map((company) => (
            <tr key={company.id} className="border-b hover:bg-gray-50">
              <td className="py-2 font-medium">{company.name}</td>
              <td className="py-2">{company.email}</td>
              <td className="py-2">{company.requestedAt}</td>
              <td className="py-2 text-right">
                <button className="text-blue-600 hover:underline text-sm">내용 보기</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
