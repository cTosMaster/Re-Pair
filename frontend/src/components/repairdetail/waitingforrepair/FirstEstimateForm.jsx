import { useEffect, useMemo, useState, useCallback } from "react";
import * as CustomerAPI from "../../../services/customerAPI";

function FirstEstimateForm({ requestId, presetList = [], itemId, onCreated }) {
  const [selected, setSelected] = useState([]);    // [{id, name, price, itemId?}]
  const [extraCost, setExtraCost] = useState("");  // 추가 금액(문자열)
  const [note, setNote] = useState("");            // 추가 수리 내용

  // 서버 합산
  const [calcLoading, setCalcLoading] = useState(false);
  const [serverPresetTotal, setServerPresetTotal] = useState(0);

  // 추가용 옵션: itemId 일치 + 삭제(X)
  const options = useMemo(() => {
    const base = Array.isArray(presetList) ? presetList : [];
    const onlyActive = base.filter((p) => !(p.is_deleted === 1 || p.isDeleted === true));
    if (!itemId) return onlyActive;
    return onlyActive.filter(
      (p) => String(p.itemId ?? p.item?.id ?? "") === String(itemId)
    );
  }, [presetList, itemId]);

  // 중복 방지
  const selectedIdSet = useMemo(
    () => new Set(selected.map((p) => p.id)),
    [selected]
  );

  // 로컬 합계
  const localPresetTotal = useMemo(
    () => selected.reduce((sum, p) => sum + (p.price || 0), 0),
    [selected]
  );

  // 추가 금액 정수화
  const extra = useMemo(
    () => parseInt((extraCost || "0").replace(/,/g, ""), 10) || 0,
    [extraCost]
  );

  const presetTotalForUI = serverPresetTotal || localPresetTotal;
  const total = presetTotalForUI + extra;

  // 합산 API
  const recalc = useCallback(async (ids) => {
    setCalcLoading(true);
    try {
      if (typeof CustomerAPI.calculateEstimateAmount === "function") {
        const { data } = await CustomerAPI.calculateEstimateAmount(ids);
        setServerPresetTotal(typeof data === "number" ? data : 0);
      } else if (typeof CustomerAPI.calculatePresetAmount === "function") {
        const res = await CustomerAPI.calculatePresetAmount(ids);
        setServerPresetTotal(typeof res?.data === "number" ? res.data : 0);
      } else {
        setServerPresetTotal(0);
      }
    } catch (e) {
      console.error("preset sum failed:", e);
      setServerPresetTotal(0);
    } finally {
      setCalcLoading(false);
    }
  }, []);

  useEffect(() => {
    const ids = selected.map((p) => p.id);
    if (ids.length > 0) recalc(ids);
    else setServerPresetTotal(0);
  }, [selected, recalc]);

  // ▼ 추가용 드롭다운(아래에서 위로 올림)
  const onSelectPresetToAdd = (e) => {
    const val = e.target.value;
    if (!val) return;
    const id = Number(val);
    const found = options.find((p) => p.id === id);
    if (!found) return;

    setSelected((prev) => (prev.some((p) => p.id === id) ? prev : [...prev, found]));
    e.target.value = "";
  };

  // ▼ 선택 멀티 드롭다운 변경 → 유지할 항목만 남김
  const onSelectedMultiChange = (e) => {
    const keepIds = new Set(Array.from(e.target.selectedOptions).map((o) => Number(o.value)));
    setSelected((prev) => prev.filter((p) => keepIds.has(p.id)));
  };

  const removeOne = (id) => setSelected((prev) => prev.filter((p) => p.id !== id));

  // 제출
  const handleSubmit = async () => {
    if (!requestId) {
      alert("요청 ID가 없습니다.");
      return;
    }
    const payload = {
      requestId: Number(requestId),
      presetIds: selected.map((p) => p.id),
      description: note,
      totalPrice: total,
    };

    try {
      await CustomerAPI.createFirstEstimate(payload);
      alert("1차 견적이 등록되었습니다.");
      if (typeof onCreated === "function") onCreated();
    } catch (e) {
      console.error(e);
      alert("견적 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      {/* 제목 */}
      <h2 className="text-xl font-semibold mb-6 text-center">1차 견적서</h2>

      {/* ✅ 프리셋(추가용) 드롭다운 ── (위로 이동) */}
      <div className="mb-6">
        <label className="block mb-1 text-sm font-medium">프리셋</label>
        <select
          defaultValue=""
          onChange={onSelectPresetToAdd}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
        >
          <option value="">
            {options.length > 0 ? "프리셋을 선택하세요" : "표시할 프리셋이 없습니다."}
          </option>
          {options.map((p) => (
            <option key={p.id} value={p.id} disabled={selectedIdSet.has(p.id)}>
              {p.name} ({(p.price ?? 0).toLocaleString()}원)
            </option>
          ))}
        </select>
      </div>

      {/* ✅ 선택한 프리셋: 멀티 드롭다운 ── (아래로 이동) */}
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">선택한 프리셋</label>
        <select
          multiple
          size={Math.max(4, Math.min(8, selected.length || 4))}
          value={selected.map((p) => String(p.id))}
          onChange={onSelectedMultiChange}
          className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
        >
          {selected.length === 0 ? (
            <option value="" disabled>
              아직 선택된 프리셋이 없습니다.
            </option>
          ) : (
            selected.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({(p.price ?? 0).toLocaleString()}원)
              </option>
            ))
          )}
        </select>

        {/* (선택칩 유지) */}
        {selected.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selected.map((p) => (
              <span
                key={`chip-${p.id}`}
                className="inline-flex items-center gap-2 text-xs bg-gray-100 rounded-full px-2.5 py-1"
              >
                {p.name}
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => removeOne(p.id)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 추가 수리 내용 + 금액 요약 */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="h-full">
          <div className="border border-gray-200 rounded-xl p-4 bg-white h-full">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">추가 수리 내용</h3>
            <textarea
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none min-h-[180px]"
              rows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="추가 수리 내역을 입력해주세요"
            />
          </div>
        </div>

        <aside className="h-full">
          <div className="border border-gray-200 rounded-xl p-4 bg-white h-full">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">금액 요약</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">프리셋 합계</span>
                <span className="font-medium">
                  {calcLoading
                    ? localPresetTotal.toLocaleString()
                    : (serverPresetTotal || 0).toLocaleString()}
                  원
                </span>
              </div>

              <div>
                <label className="block mb-1 text-gray-600">추가 금액(±)</label>
                <input
                  type="text"
                  value={extraCost}
                  onChange={(e) => setExtraCost(e.target.value)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
                  placeholder="0"
                />
              </div>

              <div className="h-px bg-gray-300 my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>총 금액</span>
                <span className="text-green-600">
                  {Number(presetTotalForUI + extra).toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 제출 */}
      <button
        type="button"
        className="w-full py-2 rounded-md bg-[#A5CD82] text-white font-medium hover:bg-[#94bb71] transition"
        onClick={handleSubmit}
      >
        제출
      </button>
    </div>
  );
}

export default FirstEstimateForm;