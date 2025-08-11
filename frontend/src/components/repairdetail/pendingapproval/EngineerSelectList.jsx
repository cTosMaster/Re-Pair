import { useState } from "react";

function EngineerSelectList({ engineerList = [] }) {
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-base font-semibold text-gray-800 mb-4">수리기사를 선택해주세요</h3>

      <div className="h-[360px] border border-gray-200 rounded-lg overflow-hidden">
        {engineerList.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            표시할 수리기사가 없습니다.
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {engineerList.map((eng, i) => {
              const isSelected = selectedId === eng.id;
              const isAssigned = eng.status === true;

              return (
                <div key={eng.id}>
                  <div
                    className={`flex items-center justify-between py-3 px-4 gap-4 ${
                      isSelected ? "bg-gray-100" : ""
                    }`}
                  >
                    {/* 프로필 + 정보 */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                        {eng.profileImage ? (
                          <img
                            src={eng.profileImage}
                            alt="프로필"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                        )}
                      </div>

                      <div className="text-sm text-gray-800 truncate">
                        <p className="font-medium truncate">{eng.name}</p>
                        <p className="text-gray-500 truncate">{eng.email}</p>
                        <p className="text-gray-500 truncate">{eng.phone}</p>
                      </div>
                    </div>

                    {/* 오른쪽: 선택 버튼 또는 배정됨 텍스트 */}
                    <div className="min-w-[80px] text-right">
                      {isAssigned ? (
                        <span className="text-sm font-semibold text-red-500">배정 됨</span>
                      ) : (
                        <button
                          className={`ml-2 px-4 py-1 text-sm rounded font-medium border transition 
                            ${isSelected
                              ? "bg-[#94bb71] text-white border-[#94bb71]"
                              : "bg-[#A5CD82] text-white border-[#A5CD82] hover:bg-[#94bb71] hover:border-[#94bb71]"
                            }`}
                          onClick={() => setSelectedId(eng.id)}
                        >
                          선택
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 얇고 연한 구분선 (마지막 요소 제외) */}
                  {i < engineerList.length - 1 && (
                    <div className="h-px bg-gray-300 w-full" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default EngineerSelectList;