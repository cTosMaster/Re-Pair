import { useEffect, useRef, useState } from "react";

function RejectReasonModal({
  visible,
  onClose,
  onSubmit,
  submitting = false,
  maxLength = 500,
  initialReason = "",
}) {
  const [reason, setReason] = useState(initialReason);
  const overlayRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setReason(initialReason);
      // 포커스
      setTimeout(() => textareaRef.current?.focus(), 0);
    }
  }, [visible, initialReason]);

  // ESC 닫기 / Ctrl+Enter 또는 Cmd+Enter 제출
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose?.();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !submitting) {
        handleConfirm();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, submitting]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current && !submitting) onClose?.();
  };

  const handleConfirm = () => {
    const v = reason.trim();
    if (!v) {
      alert("반려 사유를 입력해주세요.");
      return;
    }
    // 백엔드 규격: { reason }
    onSubmit?.(v);
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg w-full max-w-md p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <h2 className="text-lg font-semibold text-gray-800 mb-4">반려 사유</h2>

        {/* 입력창 */}
        <div className="mb-2">
          <label className="block mb-2 font-medium text-gray-700">사유 입력</label>
          <textarea
            ref={textareaRef}
            rows={5}
            maxLength={maxLength}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A5CD82]"
            placeholder="반려 사유를 입력해주세요. (예: 주소 불분명, 부품 단종, 견적 초과 등)"
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {reason.length}/{maxLength}
          </div>
        </div>

        {/* 힌트 */}
        <p className="text-xs text-gray-500 mb-4">
          단축키: <span className="font-medium">Ctrl/⌘ + Enter</span> 제출,{" "}
          <span className="font-medium">Esc</span> 닫기
        </p>

        {/* 버튼 */}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            className="px-6 py-2 rounded-md bg-[#A5CD82] text-white font-semibold hover:bg-[#94bb71] disabled:opacity-50"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "처리 중..." : "확인"}
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded-md border border-[#A5CD82] text-[#A5CD82] font-semibold hover:bg-[#f2f9f2] disabled:opacity-50"
            onClick={onClose}
            disabled={submitting}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectReasonModal;