import { useState } from "react";
import RepairgoodsManagementModal from "../modal/RepairgoodsManagementModal";

const dummyDataInit = [
  { id: 1, category: "휴대폰", name: "삼성 갤럭시 S7", price: "15,000", date: "2024.07.05" },
  { id: 2, category: "UMPC", name: "스팀덱 OLED", price: "12,000", date: "2019.06.05" },
  { id: 3, category: "전자시계", name: "갤럭시 워치 7", price: "10,000", date: "2017.08.05" },
  { id: 4, category: "콘솔 게임기", name: "플레이스테이션4", price: "8,000", date: "2019.12.11" },
  { id: 5, category: "노트북", name: "LENOVO", price: "5,000", date: "2022.08.12" },
];

const RepairgoodsManagement = ({ items: externalItems }) => {
  const items = externalItems ?? dummyDataInit;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 mt-10">
      <div className="mx-auto w-full max-w-5xl rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-6">
        
        {/* ───── 헤더 영역 ───── */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#9fc87b]">모든 수리물품</h2>
        </div>
        {/* ───── 헤더 영역 끝───── */} 

        {/* ───── 테이블 영역 ───── */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr className="border-b border-gray-200/70">
                <th className="text-left px-6 py-4 font-medium">카테고리</th>
                <th className="text-left px-6 py-4 font-medium">제품명</th>
                <th className="text-left px-6 py-4 font-medium">기본 단가</th>
                <th className="text-left px-6 py-4 font-medium">등록일자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="odd:bg-white even:bg-gray-50 hover:bg-[#f4f8ef] transition-colors"
                >
                  <td className="px-6 py-4 text-gray-800">{item.category}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{item.name}</td>
                  <td className="px-6 py-4 font-semibold tabular-nums">{item.price}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono tabular-nums">{item.date}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                    표시할 항목이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* ───── 테이블 영역 끝 ───── */}

        {/* ───── 버튼 ───── */}
          <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 rounded-lg bg-[#9fc87b] text-white font-bold hover:brightness-90 transition"
          >
            + 물품 등록
          </button>
          </div>
        {/* ───── 버튼 끝 ───── */}

      </div>

      {/* ───── 모달 영역 ───── */}
      {isModalOpen && (
        <RepairgoodsManagementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => setIsModalOpen(false)}
        />
      )}
      {/* ───── 모달 영역 끝 ───── */}
    </div>
  );
};

export default RepairgoodsManagement;