import { useEffect, useState } from "react";
import CategoryManagementModal from "../modal/CategoryManagementModal";
import { getCustomerCategories } from "../../services/centerAPI";

const CategoryManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchCustomerCategories = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const customerId = userData?.customerId;
      if (!customerId) {
        console.error("customerId 없음");
        return;
      }

      const res = await getCustomerCategories(customerId);
      const data = res.data;
      setCategories(data || []);
    } catch (err) {
      console.error("고객사 카테고리 조회 실패", err);
      setCategories([]);
    }
  };

  useEffect(() => {
    // 화면 처음 로드 시
    fetchCustomerCategories();
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    // 모달 닫을 때 새로 조회
    fetchCustomerCategories();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 mt-10">
      <div className="mx-auto w-full max-w-5xl rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#9fc87b]">카테고리 관리</h2>
        </div>

        {/* 테이블 */}
        <div className="rounded-xl border border-gray-200 max-h-96 overflow-y-auto">
          <table className="min-w-full text-sm table-fixed">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-1/2" />
            </colgroup>
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="text-left px-6 py-3 font-medium">카테고리 이름</th>
                <th className="text-left px-6 py-3 font-medium">생성일자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.customerCategoryId}>
                    <td className="px-6 py-3">{cat.name}</td>
                    <td className="px-6 py-3">
                      {new Date(cat.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-6 py-16 text-center text-gray-400">
                    표시할 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 등록 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 h-10 rounded-lg bg-[#9fc87b] text-white font-bold hover:brightness-90"
          >
            + 카테고리 등록
          </button>
        </div>
      </div>

      {/* 모달 */}
      <CategoryManagementModal
        isOpen={isModalOpen}
        onClose={handleModalClose} // 모달 닫을 때 API 재호출
      />
    </div>
  );
};

export default CategoryManagement;