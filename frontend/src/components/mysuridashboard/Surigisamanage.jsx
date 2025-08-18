import { useState } from "react";
import MySurigisaaddModal from "../modal/MySurigisaaddModal";

const Surigisamanage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 mt-10">
      <div className="mx-auto w-full max-w-5xl rounded-xl bg-white shadow-lg ring-1 ring-black/5 p-6">
        {/* 헤더 */}
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold text-[#9fc87b]">수리 기사 관리</h2>
        </div>

        {/* 테이블 */}
        <div className="rounded-xl border border-gray-200 max-h-96 overflow-y-auto">
          <table className="min-w-full text-sm table-fixed">
            <colgroup>
              <col className="w-1/2" />
              <col className="w-1/4" />
              <col className="w-1/4" />
            </colgroup>
            <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
              <tr>
                <th className="text-left px-6 py-3 font-medium">이름 / 이메일 / 전화</th>
                <th className="text-left px-6 py-3 font-medium">상태</th>
                <th className="text-left px-6 py-3 font-medium">등록일자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* 데이터 없을 때 */}
              <tr>
                <td colSpan={3} className="px-6 py-16 text-center text-gray-400">
                  표시할 항목이 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 등록 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 h-10 rounded-lg bg-[#9fc87b] text-white font-bold hover:brightness-90"
          >
            + 수리기사 등록
          </button>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <MySurigisaaddModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Surigisamanage;