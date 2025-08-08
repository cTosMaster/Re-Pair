
function RepairRequestPreview({ categoryData }) {
  const {
    title = "",
    category = "",
    product = "",
    phone = "",
    content = "",
  } = categoryData || {};

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white shadow-md rounded-xl">
      <h2 className="text-xl text-gray-500 font-semibold">수리 요청서 (읽기 전용)</h2>

      {/* 제목 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">제목</label>
        <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-800">
          {title || "-"}
        </div>
      </div>

      {/* 카테고리 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">카테고리</label>
        <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-800">
          {category || "-"}
        </div>
      </div>

      {/* 제품명 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">제품명</label>
        <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-800">
          {product || "-"}
        </div>
      </div>

      {/* 연락처 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">연락처</label>
        <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-800">
          {phone || "-"}
        </div>
      </div>

      {/* 수리 내용 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">수리 내용</label>
        <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap">
          {content || "-"}
        </div>
      </div>
    </div>
  );
}

export default RepairRequestPreview;