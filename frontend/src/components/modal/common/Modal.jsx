import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  children,
  panelClassName = "w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6",
  backdropClassName = "absolute inset-0 bg-black/30",
}) {
  // 스크롤 잠금(선택)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    // 부모는 pointer-events:none; 자식(오버레이/패널)만 이벤트 허용
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {/* 오버레이: 아래(z-0), 클릭 닫기 */}
      <div
        className={`${backdropClassName} z-0 pointer-events-auto`}
        onClick={onClose}
      />
      {/* 패널: 위(z-10), 내부 클릭은 닫힘 방지 */}
      <div
        className={`relative z-10 pointer-events-auto ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}