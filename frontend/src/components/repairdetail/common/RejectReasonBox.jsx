function RejectReasonBox({ reason }) {
  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-xl p-8 mt-4">
      {/* 제목 */}
      <h2 className="text-xl font-semibold mb-6 text-center">취소 사유</h2>

      {/* 내용 */}
      <div className="w-full border border-gray-200 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap">
        {reason || "사유가 작성되지 않았습니다."}
      </div>
    </div>
  );
}

export default RejectReasonBox;