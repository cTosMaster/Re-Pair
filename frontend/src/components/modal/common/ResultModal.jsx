import { useEffect } from "react";
import { createPortal } from "react-dom";

const styles = {
    success: {
        titleDefault: "성공",
        ring: "ring-emerald-500/10",
        badge: "from-emerald-500 to-emerald-400",
        iconFill: "#10B981",
        btn: "bg-emerald-500 hover:bg-emerald-600 text-white",
    },
    error: {
        titleDefault: "에러",
        ring: "ring-rose-500/10",
        badge: "from-rose-500 to-rose-400",
        iconFill: "#F43F5E",
        btn: "bg-rose-500 hover:bg-rose-600 text-white",
    },
    info: {
        titleDefault: "안내",
        ring: "ring-sky-500/10",
        badge: "from-sky-500 to-sky-400",
        iconFill: "#0EA5E9",
        btn: "bg-sky-500 hover:bg-sky-600 text-white",
    },
    warning: {
        titleDefault: "주의",
        ring: "ring-amber-500/10",
        badge: "from-amber-500 to-amber-400",
        iconFill: "#F59E0B",
        btn: "bg-amber-500 hover:bg-amber-600 text-white",
    },
};

const TypeIcon = ({ type = "success", className = "w-5 h-5" }) => {
    const fill = styles[type]?.iconFill || styles.success.iconFill;
    if (type === "error") {
        return (
            <svg viewBox="0 0 24 24" className={className} aria-hidden>
                <path fill={fill} d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm3.54 13.46a1 1 0 1 1-1.42 1.42L12 13.42l-2.12 2.12a1 1 0 1 1-1.42-1.42L10.58 12 8.46 9.88a1 1 0 1 1 1.42-1.42L12 10.58l2.12-2.12a1 1 0 1 1 1.42 1.42L13.42 12Z" />
            </svg>
        );
    }
    if (type === "warning") {
        return (
            <svg viewBox="0 0 24 24" className={className} aria-hidden>
                <path fill={fill} d="M12 2a1.5 1.5 0 0 1 1.3.75l9.42 16.32A1.5 1.5 0 0 1 21.42 22H2.58a1.5 1.5 0 0 1-1.3-2.93L10.7 2.75A1.5 1.5 0 0 1 12 2Zm0 6a1 1 0 0 0-1 1v5.5a1 1 0 1 0 2 0V9a1 1 0 0 0-1-1Zm0 9.75a1.25 1.25 0 1 0 1.25 1.25A1.25 1.25 0 0 0 12 17.75Z" />
            </svg>
        );
    }
    if (type === "info") {
        return (
            <svg viewBox="0 0 24 24" className={className} aria-hidden>
                <path fill={fill} d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 15h-2v-6h2Zm0-8h-2V7h2Z" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden>
            <path fill={fill} d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm5 8.3-5.66 5.66a1 1 0 0 1-1.41 0L7 12.64a1 1 0 1 1 1.41-1.41l1.88 1.88 4.95-4.95A1 1 0 1 1 17 10.3Z" />
        </svg>
    );
};

export default function ResultModal({
    open = false,
    type = "success",
    title,
    message = "",
    confirmLabel = "확인",
    onClose = () => { },
    onConfirm,
    closeOnBackdrop = true,
    closeOnEsc = true,
}) {
    const t = styles[type] || styles.success;

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    useEffect(() => {
        if (!open || !closeOnEsc) return;
        const handler = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, closeOnEsc, onClose]);

    if (!open) return null;

    const node = (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => closeOnBackdrop && onClose()} />
            <div className={`relative mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 p-6 sm:p-7 ${t.ring}`}>
                <div className={`inline-flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br ${t.badge} shadow-lg shadow-black/5`}>
                    <TypeIcon type={type} className="w-5 h-5" />
                </div>
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title || (styles[type]?.titleDefault ?? "알림")}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-gray-600 whitespace-pre-wrap">{message}</p>
                </div>
                <div className="mt-6 flex items-center justify-end gap-2">
                    <button type="button" onClick={onConfirm ?? onClose} className={`rounded-xl px-4 py-2 text-sm font-semibold shadow ${t.btn}`}>{confirmLabel}</button>
                    <button type="button" onClick={onClose} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">닫기</button>
                </div>
            </div>
        </div>
    );

    return createPortal(node, document.body);
}