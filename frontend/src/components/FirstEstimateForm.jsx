import { useState } from "react";

const FirstEstimateForm = ({ presetOptions = [] }) => {
  const [selectedId, setSelectedId] = useState("");
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [description, setDescription] = useState("");
  const [customPrice, setCustomPrice] = useState(""); // 빈 문자열로 초기화

  const handleAddPreset = () => {
    const selected = presetOptions.find((p) => p.id === Number(selectedId));
    if (selected && !selectedPresets.some((p) => p.id === selected.id)) {
      const newList = [...selectedPresets, selected];
      setSelectedPresets(newList);

      // 기존 금액이 숫자일 경우에만 누적
      const currentPrice = Number(customPrice);
      const newPrice = !isNaN(currentPrice) ? currentPrice + selected.price : selected.price;
      setCustomPrice(newPrice);
    }
    setSelectedId(""); // 초기화
  };

  const handleRemovePreset = (id) => {
    const removedPreset = selectedPresets.find(p => p.id === id);
    const newList = selectedPresets.filter((p) => p.id !== id);
    setSelectedPresets(newList);

    // 금액에서 해당 프리셋 가격만큼 차감
    const currentPrice = Number(customPrice);
    const newPrice = !isNaN(currentPrice) ? currentPrice - (removedPreset?.price || 0) : "";
    setCustomPrice(newPrice < 0 ? 0 : newPrice);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">1차 견적서</h2>

      {/* 프리셋 선택 */}
      <div className="flex items-center gap-2 mb-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 border rounded p-2"
        >
          <option value="">프리셋 선택</option>
          {presetOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddPreset}
          className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200"
        >
          +
        </button>
      </div>

      {/* 선택된 프리셋 목록 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedPresets.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-1 bg-gray-800 text-white px-2 py-1 rounded text-sm"
          >
            {p.name}
            <button onClick={() => handleRemovePreset(p.id)}>×</button>
          </div>
        ))}
      </div>

      {/* 수리 내용 */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="w-full border rounded p-2 resize-none mb-3"
        placeholder="수리 내용 (추가된 부품만 기재)"
      />

      {/* 금액 */}
      <input
        type="text"
        value={customPrice}
        onChange={(e) => setCustomPrice(e.target.value)}
        className="w-full border rounded p-2 mb-1"
        placeholder="금액"
      />
      <div className="text-sm text-gray-500 mb-4">
        프리셋으로 자동 누적되며, 수정 가능합니다
      </div>
    </div>
  );
};

export default FirstEstimateForm;