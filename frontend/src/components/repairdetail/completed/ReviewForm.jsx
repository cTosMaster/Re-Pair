import { useState } from "react";

/* ---------- 별 아이콘 ---------- */
function Star({ filled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1 transform transition-transform duration-150 hover:scale-125 active:scale-90`}
      aria-label="star"
    >
      <svg
        viewBox="0 0 20 20"
        className={`w-6 h-6 transition-colors ${
          filled ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
      >
        <path d="M10 15.27l-5.18 3.04 1.4-5.99L1 7.24l6.05-.52L10 1.5l2.95 5.22 6.05.52-5.22 5.08 1.4 5.99L10 15.27z" />
      </svg>
    </button>
  );
}

/* ---------- 별점 입력 ---------- */
function StarRating({ value, onChange, max = 5 }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex">
        {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
          <Star
            key={n}
            filled={n <= value}
            onClick={() => onChange(n)}
          />
        ))}
      </div>
      <div className="text-sm text-gray-600">
        {value > 0 ? `${value} / ${max}` : "별점을 선택해주세요"}
      </div>
    </div>
  );
}

/* ---------- 내용 입력 ---------- */
function ReviewContent({ value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium">어떤 점이 좋았나요?</label>
      <textarea
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none min-h-[140px]"
        placeholder="후기를 작성해주세요."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/* ---------- 메인 ---------- */
function ReviewForm({ initialRating = 0, initialText = "" }) {
  const [rating, setRating] = useState(initialRating);
  const [text, setText] = useState(initialText);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-lg font-semibold text-center mb-6">리뷰쓰기</h2>

      {/* 별점 */}
      <div className="mb-6">
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* 내용 */}
      <div className="mb-6">
        <ReviewContent value={text} onChange={setText} />
      </div>

      {/* 버튼 (동작 없음) */}
      <div className="flex justify-center gap-3">
        <button type="button" className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
          취소
        </button>
        <button type="button" className="px-5 py-2 rounded-md bg-[#A5CD82] text-white font-medium hover:bg-[#94bb71] transition">
          작성완료
        </button>
      </div>
    </div>
  );
}

export default ReviewForm;