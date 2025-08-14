import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import api from "../../services/api";
import { createRepairItem } from "../../services/customerAPI";

const RepairgoodsManagementModal = ({ isOpen, onClose }) => {

  // 기존 form 구조 유지
  const [form, setForm] = useState({
    category: "",
    name: "",
    price: "",
    date: ""
  });

  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // 카테고리 ID만 별도 저장

  const { user } = useAuth();

  // 모달이 열릴 때 카테고리 불러오기
  useEffect(() => {
    if (isOpen && user?.customerId) {
      api
        .get(`/customer-categories/${user.customerId}`)
        .then((res) => {
          console.log("카테고리 API 응답:", res.data);
          setCategories(res.data);
        })
        .catch((err) => {
          console.error("카테고리 목록 불러오기 실패:", err);
        });
    }
  }, [isOpen, user?.customerId]);

  if (!isOpen) return null;

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      // 숫자만 입력
      const numericValue = value.replace(/[^0-9]/g, "");
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 카테고리 변경 시 ID와 이름 동시 저장
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCat = categories.find((cat) => String(cat.id) === selectedId);

    setSelectedCategoryId(selectedId);
    setForm({ ...form, category: selectedCat ? selectedCat.name : "" });
  };

  // 등록 버튼 클릭
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategoryId) {
      alert("카테고리를 선택하세요.");
      return;
    }
    if (!form.name.trim()) {
      alert("제품명을 입력하세요.");
      return;
    }
    if (!form.price.trim()) {
      alert("기본 단가를 입력하세요.");
      return;
    }

    try {
      const data = {
        customerId: user.customerId,
        categoryId: selectedCategoryId,
        name: form.name.trim(),
        price: parseInt(form.price, 10)
      };

      await createRepairItem(data)
      alert("수리 물품이 성공적으로 등록되었습니다.");

      } catch (error) {
        console.error("수리 물품 등록 실패:", error);
        alert("등록에 실패했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-[600px] p-8 relative">
        {/* 로고 */}
        <h1 className="text-2xl font-bold text-[#9fc87b]">Re:Pair</h1>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {/* 제목 */}
        <h1 className="text-2xl font-normal text-black mb-8">수리 상품 등록</h1>

        {/* 카테고리 선택 */}
        <label className="block text-black mb-2">카테고리</label>
        <select
          name="categoryId"
          onChange={handleCategoryChange}
          value={selectedCategoryId || ""}
          className="w-full h-12 mb-6 border rounded-lg px-4 bg-white"
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* 제품명 입력 */}
        <label className="block text-black mb-2">제품명</label>
        <input
          name="name"
          type="text"
          placeholder="제품명을 입력하세요"
          onChange={handleChange}
          value={form.name}
          className="w-full h-12 mb-6 border rounded-lg px-4"
        />

        {/* 기본 단가 입력 */}
        <label className="block text-black mb-2">기본 단가</label>
        <input
          name="price"
          type="text"
          placeholder="기본 단가를 입력하세요"
          onChange={handleChange}
          value={form.price}
          className="w-full h-12 mb-6 border rounded-lg px-4"
        />

        {/* 등록 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={!selectedCategoryId || !form.name.trim() || !form.price.trim()}
          className={`w-full h-12 text-white font-bold rounded-lg transition 
            ${selectedCategoryId && form.name.trim() && form.price.trim()
              ? "bg-[#9fc87b] hover:brightness-90"
              : "bg-gray-300 cursor-not-allowed"
            }`}
        >
          등록하기
        </button>
      </div>
    </div>
  );
};

export default RepairgoodsManagementModal;