import api from "../../../services/api";
import { useState } from "react";

function RepairRequestForm() {
  const [title, setTitle] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [repairableItemId, setRepairableItemId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, "");
    setContactPhone(onlyNums);
  };

  // 더미 데이터 (컴포넌트 내부 사용)
  const categoryData = [
    {
      categoryId: 1,
      categoryName: "휴대폰",
      items: [
        { repairableItemId: 1, name: "아이폰 14" },
        { repairableItemId: 2, name: "아이폰 13" },
        { repairableItemId: 3, name: "갤럭시 S23" },
        { repairableItemId: 4, name: "갤럭시 S22" },
      ],
    },
    {
      categoryId: 2,
      categoryName: "노트북",
      items: [
        { repairableItemId: 101, name: "맥북 프로 14" },
        { repairableItemId: 102, name: "맥북 에어 M2" },
        { repairableItemId: 103, name: "그램 16" },
        { repairableItemId: 104, name: "삼성 갤럭시북" },
      ],
    },
    {
      categoryId: 3,
      categoryName: "태블릿",
      items: [
        { repairableItemId: 201, name: "아이패드 프로 11" },
        { repairableItemId: 202, name: "아이패드 에어" },
        { repairableItemId: 203, name: "갤럭시 탭 S9" },
      ],
    },
    {
      categoryId: 4,
      categoryName: "소형가전",
      items: [
        { repairableItemId: 301, name: "다이슨 드라이어" },
        { repairableItemId: 302, name: "전동면도기" },
        { repairableItemId: 303, name: "공기청정기" },
      ],
    },
  ];

  const productList =
    categoryData.find((c) => String(c.categoryId) === String(categoryId))?.items || [];

  const isFormValid =
    title.trim() &&
    contactPhone.length === 11 &&
    description.trim() &&
    categoryId &&
    repairableItemId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setErr("");
    try {
      const payload = {
        categoryId: Number(categoryId),
        repairableItemId: Number(repairableItemId),
        title: title.trim(),
        description: description.trim(),
        contactPhone: contactPhone,
      };

      const res = await api.post("/repair-requests", payload);

      console.log("응답:", res.data);
      alert("수리 요청이 전송되었습니다!");

      // 리셋
      setTitle("");
      setContactPhone("");
      setDescription("");
      setCategoryId("");
      setRepairableItemId("");
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "요청에 실패했습니다.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-16 p-8 bg-white shadow-md rounded-xl"
    >
      <h2 className="text-xl font-semibold mb-6 text-center">수리 요청서</h2>

      {err && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* 제목 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 폰 전원이 안 켜져요"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* 카테고리 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">카테고리</label>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setRepairableItemId("");
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">카테고리 선택</option>
          {categoryData.map(({ categoryId, categoryName }) => (
            <option key={categoryId} value={categoryId}>
              {categoryName}
            </option>
          ))}
        </select>
      </div>

      {/* 제품명 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">제품명</label>
        <select
          value={repairableItemId}
          onChange={(e) => setRepairableItemId(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          disabled={!categoryId}
        >
          <option value="">제품명 선택</option>
          {productList.map(({ repairableItemId, name }) => (
            <option key={repairableItemId} value={repairableItemId}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* 연락처 */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">연락처</label>
        <input
          type="text"
          value={contactPhone}
          onChange={handlePhoneChange}
          maxLength={11}
          inputMode="numeric"
          placeholder="예: 01012345678 (숫자만)"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* 수리 내용 */}
      <div className="mb-6">
        <label className="block mb-1 text-sm font-medium">수리 내용</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="전원 버튼을 눌러도 반응이 없습니다. 확인 부탁드립니다."
          className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none"
        />
      </div>

      {/* 제출 버튼 */}
      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`w-full py-2 rounded-md font-medium transition ${
          isFormValid && !loading
            ? "bg-[#A5CD82] text-white hover:bg-[#94bb71]"
            : "bg-gray-300 text-white cursor-not-allowed"
        }`}
      >
        {loading ? "전송 중..." : "제출하기"}
      </button>
    </form>
  );
}

export default RepairRequestForm;