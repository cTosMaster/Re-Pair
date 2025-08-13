import { useEffect, useState, useCallback } from 'react';
import { getCustomerCategories } from '../../services/centerAPI';
import { listRepairItems } from '../../services/customerAPI';
import { createRepairRequest } from '../../services/userAPI';

export default function RepairRequestModal({
  open,
  onClose,
  customerId,
  onSuccess,            // 성공 후 콜백(optional)
  defaultCategoryId,    // (선택) 미리 선택
  defaultItemId,        // (선택) 미리 선택
  defaultPhone = '',    // (선택) 로그인 사용자 전화번호 프리필
}) {
  const [loading, setLoading] = useState(false);
  const [cats, setCats] = useState([]);     // [{id,name}]
  const [items, setItems] = useState([]);   // [{id,name,price,categoryId,...}]

  const [form, setForm] = useState({
    categoryId: defaultCategoryId || '',
    repairableItemId: defaultItemId || '',
    title: '',
    description: '',
    contactPhone: defaultPhone || '',
  });

  const disabled = loading || !form.categoryId || !form.repairableItemId || !form.title || !form.description || !form.contactPhone;

  const change = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  // 카테고리 로드
  const loadCategories = useCallback(async () => {
    const res = await getCustomerCategories(customerId);
    const arr = Array.isArray(res?.data) ? res.data : [];
    const mapped = arr
      .map(x => ({ id: x?.id, name: x?.name }))
      .filter(x => x.id && x.name);
    setCats(mapped);
    // 기본 선택 없으면 첫 항목 자동 선택
    if (!form.categoryId && mapped.length) {
      setForm((p) => ({ ...p, categoryId: String(mapped[0].id) }));
    }
  }, [customerId]);

  // 항목 로드(카테고리 변경시)
  const loadItems = useCallback(async (categoryId) => {
    try {
      const resp = await listRepairItems({ page: 0, size: 100, customerId, categoryId });
      // 백엔드가 customerId 필터를 안받아도 content/전체에서 카테고리로 필터
      const raw = resp?.data?.content ?? resp?.data ?? [];
      const mapped = raw.map(it => ({
        id: it?.id,
        name: it?.name || it?.title || '항목',
        price: it?.price ?? it?.amount ?? 0,
        categoryId: it?.categoryId || it?.category?.id,
      })).filter(x => x.id);
      setItems(mapped);
      // 기본 선택 없으면 첫 항목 자동 선택
      if (!form.repairableItemId && mapped.length) {
        setForm((p) => ({ ...p, repairableItemId: String(mapped[0].id) }));
      }
    } catch {
      setItems([]);
    }
  }, [customerId, form.repairableItemId]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.resolve()
      .then(loadCategories)
      .finally(() => setLoading(false));
  }, [open, loadCategories]);

  useEffect(() => {
    if (!open) return;
    if (form.categoryId) loadItems(form.categoryId);
  }, [open, form.categoryId, loadItems]);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (disabled) return;
    setLoading(true);
    try {
      const payload = {
        categoryId: Number(form.categoryId),
        repairableItemId: Number(form.repairableItemId),
        title: form.title.trim(),
        description: form.description.trim(),
        contactPhone: form.contactPhone.trim(),
      };
      await createRepairRequest(payload);
      onSuccess?.(payload);
      onClose?.();
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || '요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">수리 신청</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit} className="px-6 py-5 space-y-4">
          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium mb-1">카테고리</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.categoryId}
              onChange={(e) => {
                setForm(p => ({ ...p, categoryId: e.target.value, repairableItemId: '' }));
              }}
              required
            >
              {!form.categoryId && <option value="">선택하세요</option>}
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* 수리 항목 */}
          <div>
            <label className="block text-sm font-medium mb-1">수리 항목</label>
            <select
              className="w-full rounded-lg border px-3 py-2"
              value={form.repairableItemId}
              onChange={change('repairableItemId')}
              required
            >
              {!form.repairableItemId && <option value="">선택하세요</option>}
              {items.map(it => (
                <option key={it.id} value={it.id}>
                  {it.name}{it.price ? ` · ₩${it.price.toLocaleString()}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="예) 세탁기 고장 (물빠짐 이상)"
              value={form.title}
              onChange={change('title')}
              required
            />
          </div>

          {/* 상세 설명 */}
          <div>
            <label className="block text-sm font-medium mb-1">상세 내용</label>
            <textarea
              rows={4}
              className="w-full rounded-lg border px-3 py-2 resize-y"
              placeholder="증상을 자세히 적어주세요. (예: 모델명, 증상 발생 시점, 에러코드 등)"
              value={form.description}
              onChange={change('description')}
              required
            />
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-sm font-medium mb-1">연락처</label>
            <input
              type="tel"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="예) 010-1234-5678"
              value={form.contactPhone}
              onChange={change('contactPhone')}
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">취소</button>
            <button
              type="submit"
              disabled={disabled}
              className={`px-4 py-2 rounded-lg text-white ${disabled ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {loading ? '신청 중…' : '신청하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}