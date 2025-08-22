import { useEffect, useState } from "react";
import { listPlatformCategories } from "../../services/adminAPI";
import { createCustomerCategory, getCustomerCategories } from "../../services/centerAPI";

const CategoryManagementModal = ({ isOpen, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // 플랫폼 카테고리 필터링 로직 함수
  const fetchCategories = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const customerId = userData?.customerId;
      if (!customerId) {
        console.error("customerId 없음");
        return;
      }

      const platformRes = await listPlatformCategories();
      const platformData = platformRes.data.content || [];

      const customerRes = await getCustomerCategories(customerId);
      const customerData = customerRes.data || [];

      const customerNames = customerData.map(c => c.name);

      const filtered = platformData.filter(
        p => !customerNames.includes(p.name)
      );

      setCategories(filtered);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleRegister = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const customerId = userData?.customerId;

      if (!customerId) {
        alert("고객사 ID를 찾을 수 없습니다.");
        return;
      }
      if (!selectedCategory) {
        alert("카테고리를 선택해주세요.");
        return;
      }

      const data = { name: selectedCategory };
      await createCustomerCategory(customerId, data);

      alert("카테고리가 등록되었습니다.");

      // 등록 후 다시 검사 실행
      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert("카테고리 등록에 실패했습니다.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 본문 */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">카테고리 등록</h3>

        <div className="space-y-4">
          {/* 플랫폼 카테고리 선택 */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              플랫폼 카테고리
            </label>
            <select
              className="w-full h-10 border border-gray-300 rounded-lg px-3"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              className="h-10 px-4 rounded-lg border hover:bg-gray-50"
              onClick={onClose}
            >
              닫기
            </button>
            <button
              className="h-10 px-5 rounded-lg bg-[#9fc87b] text-white font-semibold hover:brightness-90"
              onClick={handleRegister}
            >
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementModal;