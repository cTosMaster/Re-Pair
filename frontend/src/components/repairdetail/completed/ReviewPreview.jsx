function StarIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`w-5 h-5 ${filled ? "text-yellow-400" : "text-gray-200"}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M10 15.27l-5.18 3.04 1.4-5.99L1 7.24l6.05-.52L10 1.5l2.95 5.22 6.05.52-5.22 5.08 1.4 5.99L10 15.27z" />
    </svg>
  );
}

function Stars({ value = 0, max = 5 }) {
  // "", null, undefined, NaN → 0 처리 + 0~max 범위 제한
  const n = Number(value);
  const safe = Number.isFinite(n) ? Math.min(max, Math.max(0, Math.floor(n))) : 0;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((x) => (
        <StarIcon key={x} filled={x <= safe} />
      ))}
    </div>
  );
}

function ReviewPreview({ rating, text, author, dateText, className = "" }) {
  const hasText = typeof text === "string" && text.trim().length > 0;
  const safeAuthor = typeof author === "string" && author.trim() ? author.trim() : null;
  const safeDate = typeof dateText === "string" && dateText.trim() ? dateText.trim() : null;

  return (
    <div
      className={
        `max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200 ` +
        `text-left not-italic ${className}`
      }
    >
      {/* 상단: 별점 / 작성자·날짜 */}
      <div className="flex items-center justify-between mb-3">
        <Stars value={rating} />
        {(safeAuthor || safeDate) && (
          <div className="text-xs text-gray-500 whitespace-nowrap">
            {safeAuthor && <span className="mr-2">{safeAuthor}</span>}
            {safeDate && <span>{safeDate}</span>}
          </div>
        )}
      </div>

      {/* 내용 */}
      {hasText ? (
        <p className="text-sm text-gray-800 whitespace-pre-line">{text}</p>
      ) : (
        <p className="text-sm text-gray-600">아직 작성 전입니다.</p>
      )}
    </div>
  );
}

export default ReviewPreview;