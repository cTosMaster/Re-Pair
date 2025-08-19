import { useMemo, useState } from "react";
import ResultModal from "../components/modal/common/ResultModal"; // 경로 맞게 조정

export function useResultModal() {
  const [state, setState] = useState({
    open: false,
    type: "success",
    title: undefined,
    message: "",
    confirmLabel: "확인",
    onConfirm: undefined,
  });

  const open = (message, options = {}) =>
    setState((s) => ({ ...s, open: true, message, ...options }));

  const close = () => setState((s) => ({ ...s, open: false }));

  const openSuccess = (msg, opt) => open(msg, { ...opt, type: "success" });
  const openError   = (msg, opt) => open(msg, { ...opt, type: "error" });
  const openInfo    = (msg, opt) => open(msg, { ...opt, type: "info" });
  const openWarn    = (msg, opt) => open(msg, { ...opt, type: "warning" });

  const Modal = useMemo(
    () => <ResultModal {...state} onClose={close} />,
    [state]
  );

  return { Modal, open, openSuccess, openError, openInfo, openWarn, close };
}