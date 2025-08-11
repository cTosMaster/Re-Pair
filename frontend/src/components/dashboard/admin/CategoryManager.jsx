import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCategories,
  upsertCategory,
  deleteCategory,
} from '../../../services/adminAPI'; // ← 경로 조정
import {
  Plus, Trash2, RefreshCw, Pencil, Tag, ChevronLeft, ChevronRight, Search,
} from 'lucide-react';

const CHIPS_PER_PAGE = 10;

export default function CategoryManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState(new Set()); // 선택된 카테고리 id들
  const [page, setPage] = useState(0);

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');

  const mapRow = useCallback((c) => ({
    id: c.category_id ?? c.id,
    name: c.name ?? c.categoryName ?? '',
    createdAt: c.created_at ?? c.createdAt,
  }), []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategories();
      const data = res?.data ?? {};
      const list = (data.content ?? data.items ?? data.data ?? data) || [];
      const mapped = Array.isArray(list) ? list.map(mapRow) : [];
      setItems(mapped);
      setSelected(new Set());
      setPage(0);
    } catch (e) {
      console.warn('카테고리 조회 실패:', e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [mapRow]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // 검색 필터
  const filtered = useMemo(() => {
    if (!keyword) return items;
    const k = keyword.toLowerCase();
    return items.filter((it) => (it.name || '').toLowerCase().includes(k));
  }, [items, keyword]);

  // 페이징
  const pageCount = Math.max(1, Math.ceil(filtered.length / CHIPS_PER_PAGE));
  const pageItems = filtered.slice(page * CHIPS_PER_PAGE, page * CHIPS_PER_PAGE + CHIPS_PER_PAGE);
  const canPrev = page > 0;
  const canNext = page + 1 < pageCount;

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setModalOpen(true);
  };

  const openEdit = (id, currentName) => {
    setEditingId(id);
    setName(currentName || '');
    setModalOpen(true);
  };

  const save = async () => {
    const payload = {
      id: editingId ?? undefined,
      category_id: editingId ?? undefined, // 호환용
      name,
      categoryName: name,                  // 호환용
    };
    try {
      await upsertCategory(payload);
      setModalOpen(false);
      await fetchList();
    } catch {
      alert('저장에 실패했습니다.');
    }
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const removeSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`선택된 ${selected.size}개 카테고리를 삭제할까요?`)) return;
    for (const id of selected) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await deleteCategory(id);
      } catch {
        /* 계속 진행 */
      }
    }
    await fetchList();
  };

  return (
    <div className="space-y-5">
      {/* 상단 헤더/액션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Tag size={18} className="text-emerald-700" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">카테고리 관리</div>
            <div className="text-sm text-gray-500">카테고리 수 : {items.length}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchList}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            새로고침
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          >
            <Plus size={16} /> 생성
          </button>
          <button
            onClick={removeSelected}
            disabled={selected.size === 0}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm disabled:opacity-40 hover:bg-red-100"
          >
            <Trash2 size={16} /> 삭제
          </button>
        </div>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-9 pr-3 py-2 border rounded-lg text-sm w-72"
            placeholder="카테고리명 검색"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0); }}
          />
        </div>
        <div className="text-sm text-gray-500">페이지 {page + 1} / {pageCount}</div>
      </div>

      {/* 칩 리스트 + 좌우 네비 */}
      <div className="relative">
        {/* 왼쪽 화살표 */}
        <button
          className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border bg-white shadow hover:bg-gray-50 disabled:opacity-30 items-center justify-center"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={!canPrev}
          aria-label="이전"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="bg-white rounded-xl shadow-sm p-5 overflow-hidden">
          {loading && items.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Array.from({ length: CHIPS_PER_PAGE }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-200/60 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <div className="py-14 text-center text-gray-400">표시할 카테고리가 없습니다.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {pageItems.map((c) => {
                const isOn = selected.has(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleOne(c.id)}
                    className={`group h-10 px-3 rounded-lg border flex items-center justify-between text-sm transition
                      ${isOn ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-white hover:bg-gray-50'}
                    `}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`inline-block w-3.5 h-3.5 rounded-full border
                          ${isOn ? 'border-emerald-600 bg-emerald-600' : 'border-gray-400'}
                        `}
                      />
                      {c.name}
                    </span>
                    <span
                      onClick={(e) => { e.stopPropagation(); openEdit(c.id, c.name); }}
                      className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-gray-700"
                      title="수정"
                    >
                      <Pencil size={16} />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 오른쪽 화살표 */}
        <button
          className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border bg-white shadow hover:bg-gray-50 disabled:opacity-30 items-center justify-center"
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          disabled={!canNext}
          aria-label="다음"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 생성/수정 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingId ? '카테고리 수정' : '카테고리 생성'}</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <label className="text-sm block">
              <span className="block mb-1 text-gray-600">카테고리명</span>
              <input
                className="w-full px-3 py-2 border rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                placeholder="예) 스마트폰"
                autoFocus
              />
            </label>

            <div className="mt-6 flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setModalOpen(false)}>취소</button>
              <button className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-40" onClick={save} disabled={!name.trim()}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}