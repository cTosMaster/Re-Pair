import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createEngineer,updateEngineer } from "../../services/customerAPI";

const MySurigisaaddModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
  });

  // initialData 변경 시 form에 반영
  useEffect(() => {
    if (initialData) {
      // 수정 모드 → 비밀번호는 숨김
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        passwordConfirm: "",
        phone: initialData.phone || "",
      });
    } else {
      // 등록 모드 → 초기화
      setForm({
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
        phone: "",
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // 수정 모드 → 비밀번호 체크 없음
    if (initialData) {
      if (!form.name || !form.email || !form.phone) {
        alert("이름, 이메일, 연락처를 모두 입력해주세요.");
        return;
      }
    } else {
      // 등록 모드 → 비밀번호 포함
      if (!form.name || !form.email || !form.phone || !form.password || !form.passwordConfirm) {
        alert("모든 필드를 입력해주세요.");
        return;
      }

      if (form.password !== form.passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    try {
      if (initialData) {
        // 수정 모드 → updateEngineer 호출
        await updateEngineer(initialData.engineerId, {
          name: form.name,
          email: form.email,
          phone: form.phone,
        });
        alert("수리기사 정보가 수정되었습니다.");
      } else {
        // 등록 모드 → createEngineer 호출
        await createEngineer({
          customerId: user.customerId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          passwordcheck: form.passwordConfirm,
        });
        alert("수리기사가 성공적으로 등록되었습니다.");
      }

      if (onSubmit) onSubmit(); // 목록 갱신
      onClose();
    } catch (error) {
      console.error("수리기사 등록/수정 실패:", error);
      alert("저장에 실패했습니다.");
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-[540px]">
        <h1 className="text-2xl font-semibold mb-6">
          {initialData ? "수리기사 수정" : "수리기사 등록"}
        </h1>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block mb-1">이름 *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1">이메일 *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          <div>
            <label className="block mb-1">연락처 *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>

          {/* 등록 모드일 때만 비밀번호 입력 */}
          {!initialData && (
            <>
              <div>
                <label className="block mb-1">비밀번호 *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>

              <div>
                <label className="block mb-1">비밀번호 확인 *</label>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 rounded-lg font-semibold px-4 py-2"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-[#a3cd7f] text-white rounded-lg font-bold px-4 py-2"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MySurigisaaddModal;
