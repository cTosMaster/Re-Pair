import { useState, useEffect } from "react";
import KR_REGIONS from "../../constants/regions.kr";
import { getCategories } from "../../services/adminAPI";

const RegionSelectModal = ({ onClose, onSelect, defaultRegion, defaultCategory }) => {
  const [activeTab, setActiveTab] = useState("region"); // region | category
  const [selectedSi, setSelectedSi] = useState(KR_REGIONS[0].si);
  const [categories, setCategories] = useState([]);

  const [selectedRegion, setSelectedRegion] = useState(defaultRegion || null);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory || null);

  const currentRegion = KR_REGIONS.find((r) => r.si === selectedSi);

  useEffect(() => {
    if (activeTab === "category") {
      const fetchCategories = async () => {
        try {
          const res = await getCategories();
          setCategories(res?.data?.content || []);
        } catch (err) {
          console.error("카테고리 목록 불러오기 실패:", err);
        }
      };
      fetchCategories();
    }
  }, [activeTab]);

  const handleSelectRegion = (region) => {
    setSelectedRegion((prev) => (prev === region ? null : region));
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  const handleReset = () => {
    setSelectedRegion(null);
    setSelectedCategory(null);
  };

  const handleConfirm = () => {
    onSelect({
      region: selectedRegion,
      category: selectedCategory,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">지역 / 카테고리 선택</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>

        {/* 현재 선택 표시 */}
        <div className="px-6 py-2 border-b text-sm text-gray-600 flex gap-4">
          <span>
            지역:{" "}
            {selectedRegion ? (
              <span className="font-semibold text-[#9fc87b]">{selectedRegion}</span>
            ) : (
              <span className="text-gray-400">(선택 안됨)</span>
            )}
          </span>
          <span>
            카테고리:{" "}
            {selectedCategory ? (
              <span className="font-semibold text-[#9fc87b]">{selectedCategory}</span>
            ) : (
              <span className="text-gray-400">(선택 안됨)</span>
            )}
          </span>
        </div>

        {/* 탭 */}
        <div className="flex border-b">
          <div
            onClick={() => setActiveTab("region")}
            className={`flex-1 text-center py-2 font-semibold cursor-pointer ${
              activeTab === "region"
                ? "border-b-2 border-[#9fc87b] text-[#9fc87b]"
                : "text-gray-400 border-b-2 border-gray-200"
            }`}
          >
            지역 선택
          </div>
          <div
            onClick={() => setActiveTab("category")}
            className={`flex-1 text-center py-2 font-semibold cursor-pointer ${
              activeTab === "category"
                ? "border-b-2 border-[#9fc87b] text-[#9fc87b]"
                : "text-gray-400 border-b-2 border-gray-200"
            }`}
          >
            카테고리
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "region" ? (
            <div className="flex">
              {/* 좌측 시·도 */}
              <div className="w-1/3 border-r overflow-y-auto bg-gray-50 max-h-[60vh]">
                {KR_REGIONS.map((region) => (
                  <div
                    key={region.si}
                    onClick={() => setSelectedSi(region.si)}
                    className={`px-4 py-2 cursor-pointer transition-colors ${
                      selectedSi === region.si
                        ? "text-[#9fc87b] font-semibold bg-white border-l-4 border-[#9fc87b]"
                        : "text-gray-700 hover:bg-green-50"
                    }`}
                  >
                    {region.si
                      .replace("특별시", "")
                      .replace("광역시", "")
                      .replace("특별자치도", "")
                      .replace("특별자치시", "")
                      .replace("도", "")}
                  </div>
                ))}
              </div>

              {/* 우측 구/군 */}
              <div className="flex-1 overflow-y-auto bg-white max-h-[60vh]">
                {currentRegion?.gu.map((g) => {
                  const fullRegion = `${selectedSi} ${g}`;
                  const isSelected = selectedRegion === fullRegion;
                  return (
                    <div
                      key={g}
                      onClick={() => handleSelectRegion(fullRegion)}
                      className={`px-6 py-2 cursor-pointer border-b transition-colors ${
                        isSelected
                          ? "bg-[#9fc87b] text-white font-semibold"
                          : "hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {g}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4">
              {categories.length === 0 ? (
                <div className="p-6 text-gray-400 text-center">불러오는 중...</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.name;
                    return (
                      <div
                        key={cat.categoryId}
                        onClick={() => handleSelectCategory(cat.name)}
                        className={`px-4 py-2 cursor-pointer border rounded transition-colors ${
                          isSelected
                            ? "bg-[#9fc87b] text-white font-semibold"
                            : "hover:bg-green-50 hover:text-green-700"
                        }`}
                      >
                        {cat.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            초기화
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 rounded bg-[#9fc87b] text-white font-semibold hover:brightness-90"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionSelectModal;