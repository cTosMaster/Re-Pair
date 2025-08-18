import { useState, useEffect } from "react";
import { updateEngineer, deleteEngineer } from "../../services/customerAPI";

const MySurigisaEditModal = ({ isOpen, onClose, engineer }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (engineer) {
      setForm({
        name: engineer.name || "",
        email: engineer.email || "",
        phone: engineer.phone || "",
      });
    }
  }, [engineer]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // 연락처: 숫자만 허용 + 최대 11자리
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 11);
      setForm((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isFormValid =
    form.name.trim() && form.email.trim() && form.phone.trim().length === 11;

  // 저장 (수정)
  const handleSave = async () => {
    if (!isFormValid) return;
    try {
      setSaving(true);
      await updateEngineer(engineer.engineerId, {
        name: form.name,
        email: form.email,
        phone: form.phone,
      });
      alert("수리기사 정보가 수정되었습니다.");
      onClose();
    } catch (error) {
      console.error("수리기사 수정 실패:", error);
      alert("수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      setDeleting(true);
      await deleteEngineer(engineer.engineerId);
      alert("수리기사가 삭제되었습니다.");
      onClose();
    } catch (error) {
      console.error("수리기사 삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] p-8 relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {/* 제목 */}
        <h1 className="text-2xl font-semibold text-black mb-8">수리기사 수정</h1>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* 이름 */}
          <div>
            <label className="block mb-1">이름</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block mb-1">이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
              placeholder="이메일을 입력하세요"
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block mb-1">연락처</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              maxLength={11}
              className="w-full h-12 border border-gray-300 rounded-lg px-4"
              placeholder="연락처를 입력하세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
            >
              {deleting ? "삭제중…" : "삭제하기"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isFormValid || saving}
              className={`px-4 py-2 rounded-lg font-bold text-white ${
                isFormValid
                  ? "bg-[#9fc87b] hover:brightness-90"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {saving ? "저장중…" : "수정하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MySurigisaEditModal;