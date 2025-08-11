function FinalEstimatePreview({ estimate }) {
  if (!estimate) return null;

  const {
    presets = [],         // [{ id, name, price }]
    extraNote = "-",      // 추가 수리 내용
    totalPrice = 0,       // 총 금액
    beforeImages = [],    // 수리 전 사진 (URL 배열 or dataURL)
    afterImages = [],     // 수리 후 사진 (URL 배열 or dataURL)
  } = estimate;

  // 프론트만으로 다운로드 처리 (URL/dataURL 모두 지원)
  const downloadImage = async (filename, src) => {
    try {
      // dataURL이면 바로 blob 변환
      if (src.startsWith("data:")) {
        const res = await fetch(src);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        trigger(url, filename);
        URL.revokeObjectURL(url);
        return;
      }
      // 일반 URL
      const res = await fetch(src, { mode: "cors" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      trigger(url, filename);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("다운로드 실패:", e);
      alert("아직 연결이 안되어있음");
    }
  };

  const trigger = (objectUrl, filename) => {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl text-gray-500 font-semibold text-center">최종 견적서 (읽기 전용)</h2>

      {/* 선택된 프리셋 목록 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2 text-gray-800">적용된 프리셋</h3>
        <div className="border border-gray-200 rounded-md px-3 py-2 flex flex-wrap gap-2 min-h-[40px]">
          {presets.length === 0 ? (
            <span className="text-sm text-gray-400">적용된 프리셋이 없습니다.</span>
          ) : (
            presets.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center text-sm bg-gray-100 rounded-full px-3 py-1"
              >
                {p.name} ({p.price?.toLocaleString()}원)
              </span>
            ))
          )}
        </div>
      </div>

      {/* 추가 수리 내용 + 금액 요약 */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 추가 수리 내용 */}
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">추가 수리 내용</h3>
          <p className="text-sm text-gray-700 whitespace-pre-line min-h-[180px]">
            {extraNote || "-"}
          </p>
        </div>

        {/* 금액 요약 */}
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">금액 요약</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">프리셋 합계</span>
              <span className="font-medium">
                {presets.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()}원
              </span>
            </div>
            <div className="h-px bg-gray-300 my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>총 금액</span>
              <span className="text-green-600">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* 수리 전 사진 */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">수리 전 사진</h3>
        {beforeImages.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 사진이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {beforeImages.map((src, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={src}
                  alt={`수리 전 ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => downloadImage(`before-${idx + 1}.jpg`, src)}
                  className="absolute top-1 right-1 hidden group-hover:flex items-center bg-black/60 text-white text-xs rounded px-2 py-0.5"
                >
                  다운로드
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 수리 후 사진 */}
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">수리 후 사진</h3>
        {afterImages.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 사진이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {afterImages.map((src, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={src}
                  alt={`수리 후 ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => downloadImage(`after-${idx + 1}.jpg`, src)}
                  className="absolute top-1 right-1 hidden group-hover:flex items-center bg-black/60 text-white text-xs rounded px-2 py-0.5"
                >
                  다운로드
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FinalEstimatePreview;