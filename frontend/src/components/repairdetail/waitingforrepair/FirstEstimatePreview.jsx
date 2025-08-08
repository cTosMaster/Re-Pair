function FirstEstimatePreview({
  estimate = {
    presets: [],       // [{ id, name, price }]
    extraNote: "",     // 추가 수리 내용
    totalPrice: 0,     // 총 금액
    createdAt: "",     // 작성일 (선택)
  },
}) {
  const { presets = [], extraNote = "", totalPrice = 0, createdAt = "" } = estimate;

  const format = (n) =>
    (Number.isFinite(n) ? n : 0).toLocaleString() + "원";

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">1차 견적서 (읽기 전용)</h2>
        {createdAt && <span className="text-xs text-gray-500">{createdAt}</span>}
      </div>

      {/* 프리셋 목록 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">적용된 프리셋</label>
        <div className="border border-gray-200 rounded-md overflow-hidden">
          {presets.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">
              적용된 프리셋이 없습니다.
            </div>
          ) : (
            <div className="max-h-[240px] overflow-y-auto">
              {presets.map((p, i) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm text-gray-800 truncate">{p.name}</p>
                    <p className="text-sm text-gray-700">
                      {format(p.price ?? 0)}
                    </p>
                  </div>
                  {i < presets.length - 1 && <div className="h-px bg-gray-300" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 추가 수리 내용 + 총 금액 */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 추가 수리 내용 */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap min-h-[88px]">
            {extraNote || "추가 수리 내용이 없습니다."}
          </div>
        </div>

        {/* 총 금액 */}
        <aside className="lg:col-span-1">
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex justify-between text-base font-semibold">
              <span>총 금액</span>
              <span className="text-green-600">{format(totalPrice)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default FirstEstimatePreview;