import React, { useEffect, useMemo, useState } from "react";
import { createPreset, listRepairItems } from "../../services/customerAPI";
import { useAuth } from "../../hooks/useAuth";

/**
 * PresetRequestDto
 * {
 *   customerId: number,
 *   categoryId: number,
 *   itemId: number,
 *   name: string,
 *   description: string,
 *   price: number
 * }
 */
export default function PresetModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const customerId = user?.customerId ?? user?.customer_id ?? null;

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // 고객 수리물품 목록 (category 포함)

  // 폼 상태
  const [categoryId, setCategoryId] = useState("");
  const [itemId, setItemId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // 아이템 목록 로드
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        if (!customerId) return;
        const res = await listRepairItems(customerId);
        const data = res?.data ?? [];
        // 방어적 매핑: itemId / id, categoryId / category.id / categoryId, name, price
        const mapped = (Array.isArray(data) ? data : (Array.isArray(data?.content) ? data.content : []))
          .map((r) => {
            const cid = r?.categoryId ?? r?.category_id ?? r?.category?.id ?? null;
            const cname = r?.categoryName ?? r?.category?.name ?? r?.category ?? "";
            const iid = r?.itemId ?? r?.id ?? r?.repairItemId ?? null;
            const iname = r?.name ?? r?.itemName ?? "";
            const iprice = r?.price ?? r?.basePrice ?? 0;
            return {
              itemId: iid,
              itemName: iname,
              basePrice: iprice,
              categoryId: cid,
              categoryName: cname,
            };
          })
          .filter((x) => x.itemId != null);
        setItems(mapped);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [isOpen, customerId]);

  // 카테고리 셀렉트 옵션
  const categoryOptions = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.categoryId)) {
        map.set(it.categoryId, it.categoryName || "(카테고리)");
      }
    }
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [items]);

  // 현재 카테고리에 해당하는 아이템 옵션
  const itemOptions = useMemo(() => {
    if (!categoryId) return [];
    return items
      .filter((it) => String(it.categoryId) === String(categoryId))
      .map((it) => ({
        value: it.itemId,
        label: it.itemName,
        basePrice: it.basePrice,
      }));
  }, [items, categoryId]);

  // 아이템 변경 시 기본 가격 채우기
  useEffect(() => {
    if (!itemId) return;
    const found = itemOptions.find((o) => String(o.value) === String(itemId));
    if (found && (price === "" || Number(price) === 0)) {
      setPrice(String(found.basePrice ?? ""));
    }
  }, [itemId]); // eslint-disable-line

  if (!isOpen) return null;

  const canSubmit =
    customerId &&
    categoryId &&
    itemId &&
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    String(price).trim() !== "" &&
    !Number.isNaN(Number(price));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;

    const payload = {
      customerId: Number(customerId),
      categoryId: Number(categoryId),
      itemId: Number(itemId),
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
    };

    setLoading(true);
    try {
      await createPreset(payload);
      onCreated?.();
    } catch (err) {
      console.error(err);
      alert("프리셋 등록 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-[520px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">프리셋 등록</h2>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded border hover:bg-gray-50"
          >
            닫기
          </button>
        </div>

        {!customerId ? (
          <div className="text-red-500 text-sm">
            고객사 정보가 없습니다. 다시 로그인 후 시도해 주세요.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 카테고리 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">카테고리</label>
              <select
                className="w-full h-11 border rounded-lg px-3"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setItemId("");
                }}
                required
              >
                <option value="">카테고리를 선택하세요</option>
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 품목(아이템) */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">제품(아이템)</label>
              <select
                className="w-full h-11 border rounded-lg px-3"
                value={itemId}
                onChange={(e) => setItemId(e.target.value)}
                disabled={!categoryId}
                required
              >
                <option value="">{categoryId ? "제품을 선택하세요" : "카테고리를 먼저 선택하세요"}</option>
                {itemOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 프리셋명 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">프리셋명</label>
              <input
                className="w-full h-11 border rounded-lg px-3"
                placeholder="예) 기본 점검 + 청소 패키지"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">설명</label>
              <textarea
                className="w-full min-h-[90px] border rounded-lg px-3 py-2"
                placeholder="프리셋 상세 설명을 입력하세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* 기본 단가 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">기본 단가</label>
              <input
                type="number"
                min={0}
                className="w-full h-11 border rounded-lg px-3"
                placeholder="예) 20000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className={`w-full h-12 rounded-lg text-white font-bold ${
                canSubmit && !loading ? "bg-[#9fc87b] hover:opacity-90" : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {loading ? "등록 중..." : "등록하기"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}