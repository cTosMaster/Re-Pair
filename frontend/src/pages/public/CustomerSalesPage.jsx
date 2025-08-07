const dummyData = {
  company: {
    name: '수리수리전자',
    address: '서울시 강남구 테헤란로 123',
    openingHours: '09:00 ~ 18:00',
    contactName: '홍길동',
    contactPhone: '010-1234-5678',
    averageRating: 4.5,
    imageUrl: 'data:image/png;base64,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'
  },
  repairableItems: [
    { id: 1, name: '갤럭시 S7', category: '휴대폰', price: 30000 },
    { id: 2, name: 'Lenovo thinkpad 307', category: '노트북', price: 50000 },
    { id: 3, name: '샤오미 ML2', category: '보조배터리', price: 40000 },
  ],
  reviews: [
    { id: 1, username: 'user01', rating: 5, content: '아주 만족스러워요!', createdAt: '2025-08-01' },
    { id: 2, username: 'user02', rating: 4, content: '빠른 대응 감사합니다.', createdAt: '2025-08-03' },
  ]
};

export default function CustomerSalesPage() {
  const { company, repairableItems, reviews } = dummyData;

  return (
    <div className="relative pb-40">
      <div className="p-6 max-w-6xl mx-auto space-y-12">
        {/* 🔷 고객사 프로필 카드 */}
        <div className="relative bg-gradient-to-br from-indigo-100 to-white rounded-3xl shadow-xl overflow-hidden">
          <img src={company.imageUrl} alt="Company" className="w-full h-200 object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/40 to-transparent p-6 flex flex-col justify-end">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>주소:</strong> {company.address}</p>
              <p><strong>영업시간:</strong> {company.openingHours}</p>
              <p><strong>담당자:</strong> {company.contactName} ({company.contactPhone})</p>
              <p><strong>평균 평점:</strong> ⭐ {company.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        {/* 🔶 수리 가능 항목 */}
        <div className="bg-white rounded-3xl shadow-md p-8">
          <h3 className="text-2xl font-semibold mb-6 border-b pb-2">수리 가능 항목</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {repairableItems.map(item => (
              <li key={item.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:shadow-md transition">
                <div className="text-sm text-gray-500 mb-1">{item.category}</div>
                <div className="font-semibold text-lg text-gray-800">{item.name}</div>
                <div className="mt-2 text-blue-600 font-bold">₩{item.price.toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* 🟢 후기 목록 */}
        <div className="bg-white rounded-3xl shadow-md p-8">
          <h3 className="text-2xl font-semibold mb-6 border-b pb-2">고객 후기</h3>
          <ul className="space-y-4">
            {reviews.map(review => (
              <li key={review.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-800 font-medium">{review.username}</span>
                  <span className="text-yellow-500 text-sm">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{review.content}</p>
                <p className="text-xs text-gray-400">작성일: {review.createdAt}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 🟡 하단 고정 툴바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-6 flex justify-between items-center shadow-md z-50">
        <p className="text-sm font-semibold text-gray-800">해당 업체에서 수리를 하고 싶다면?</p>
        <button className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700">
          수리신청
        </button>
      </div>
    </div>
  );
}