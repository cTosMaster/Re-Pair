import { useCallback, useEffect, useMemo, useState } from "react";
import {
    listPlatformCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../../services/adminAPI"; // 경로는 프로젝트 구조에 맞게 조정
import {
    Plus, Trash2, RefreshCw, Pencil, Tag, ChevronLeft, ChevronRight, Search, SortAsc, SortDesc,
} from "lucide-react";

const PAGE_SIZE = 30;

export default function CategoryManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // 서버 페이징/정렬 상태
    const [page, setPage] = useState(0);            // 0-based
    const [size, setSize] = useState(PAGE_SIZE);
    const [sortBy, setSortBy] = useState("categoryId");
    const [sortDir, setSortDir] = useState("asc");  // 'asc' | 'desc'

    // 서버에서 내려오는 메타
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    // 검색/선택/모달 상태
    const [keyword, setKeyword] = useState("");
    const [selected, setSelected] = useState(new Set()); // 선택된 id들

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState("");

    // DTO 매핑
    const mapRow = useCallback((c) => ({
        id: Number(c.categoryId ?? c.id),
        name: c.name ?? "",
        createdAt: c.createdAt ?? null,
    }), []);

    const fetchList = useCallback(async (nextPage = page, nextSize = size, nextSortBy = sortBy, nextSortDir = sortDir) => {
        setLoading(true);
        try {
            const res = await listPlatformCategories({
                page: nextPage,
                size: nextSize,
                sortBy: nextSortBy,
                sortDir: nextSortDir,
            });
            const data = res?.data ?? {};
            const content = Array.isArray(data.content) ? data.content : [];
            const mapped = content.map(mapRow);

            // 만약 현재 페이지가 범위를 벗어나면 마지막 페이지로 이동
            if (nextPage > 0 && data.totalPages != null && nextPage >= data.totalPages) {
                const last = Math.max(0, (data.totalPages ?? 1) - 1);
                setPage(last);
                // 재호출하도록 종료
                return;
            }

            setItems(mapped);
            setTotalPages(data.totalPages ?? 1);
            setTotalElements(data.totalElements ?? mapped.length);
            setSelected(new Set());
        } catch (e) {
            console.warn("카테고리 조회 실패:", e);
            setItems([]);
            setTotalPages(1);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [page, size, sortBy, sortDir, mapRow]);

    useEffect(() => {
        fetchList();
    }, [page, size, sortBy, sortDir, fetchList]);

    // 현재 페이지 항목에서만 클라이언트 검색
    const filtered = useMemo(() => {
        if (!keyword) return items;
        const k = keyword.toLowerCase();
        return items.filter((it) => (it.name || "").toLowerCase().includes(k));
    }, [items, keyword]);

    const openCreate = () => {
        setEditingId(null);
        setName("");
        setModalOpen(true);
    };

    const openEdit = (id, currentName) => {
        setEditingId(Number(id));
        setName(currentName || "");
        setModalOpen(true);
    };

    const save = async () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        try {
            if (editingId == null) {
                // 생성: { name }
                await createCategory({ name: trimmed });
                // 새 항목이 보이도록 첫 페이지로 이동(정렬이 categoryId asc일 때 유리)
                setPage(0);
            } else {
                // 수정: { name }
                await updateCategory(editingId, { name: trimmed });
            }
            setModalOpen(false);
            await fetchList();
        } catch (e) {
            const msg = e?.response?.data?.message || "저장에 실패했습니다.";
            alert(msg);
        }
    };

    const toggleOne = (id) => {
        const nid = Number(id);
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(nid) ? next.delete(nid) : next.add(nid);
            return next;
        });
    };

    const removeSelected = async () => {
        if (selected.size === 0) return;
        if (!confirm(`선택된 ${selected.size}개 카테고리를 삭제할까요?`)) return;
        try {
            for (const id of selected) {
                // eslint-disable-next-line no-await-in-loop
                await deleteCategory(id);
            }
            // 삭제 후 현재 페이지가 비면 이전 페이지로 이동될 수 있게 재조회
            await fetchList();
        } catch (e) {
            const msg = e?.response?.data?.message || "삭제 중 일부 오류가 발생했습니다.";
            alert(msg);
            await fetchList();
        }
    };

    const toggleSortDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

    return (
        <div className="space-y-5">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Tag size={18} className="text-emerald-700" />
                    </div>
                    <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-900">카테고리 관리</div>
                        <div className="text-sm text-gray-500">총 {totalElements}개</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchList()}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
                        disabled={loading}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
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

            {/* 검색/정렬/페이지 사이즈 */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            className="pl-9 pr-3 py-2 border rounded-lg text-sm w-72"
                            placeholder="현재 페이지에서 카테고리명 검색"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            className="border rounded-lg px-2 py-2 text-sm"
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                        >
                            <option value="categoryId">정렬: ID</option>
                            <option value="name">정렬: 이름</option>
                            <option value="createdAt">정렬: 생성일</option>
                        </select>
                        <button
                            className="inline-flex items-center gap-1 px-2 py-2 border rounded-lg bg-white hover:bg-gray-50"
                            onClick={() => { toggleSortDir(); setPage(0); }}
                            title={`정렬: ${sortDir.toUpperCase()}`}
                        >
                            {sortDir === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
                            <span className="text-sm">{sortDir.toUpperCase()}</span>
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">페이지 크기</span>
                    <select
                        className="border rounded-lg px-2 py-1"
                        value={size}
                        onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                    >
                        {[10, 20, 30, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span className="ml-3 text-gray-500">페이지 {page + 1} / {totalPages || 1}</span>
                </div>
            </div>

            {/* 리스트 */}
            <div className="relative">
                {/* 좌우 페이지 네비 */}
                <button
                    className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border bg-white shadow hover:bg-gray-50 disabled:opacity-30 items-center justify-center"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page <= 0}
                    aria-label="이전 페이지"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="bg-white rounded-xl shadow-sm p-5 overflow-hidden">
                    {loading && items.length === 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Array.from({ length: size }).slice(0, 10).map((_, i) => (
                                <div key={i} className="h-10 bg-gray-200/60 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-14 text-center text-gray-400">표시할 카테고리가 없습니다.</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {filtered.map((c) => {
                                const isOn = selected.has(c.id);
                                const createdStr = c.createdAt ? new Date(c.createdAt).toLocaleString() : null;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => toggleOne(c.id)}
                                        title={createdStr ? `생성일: ${createdStr}` : undefined}
                                        className={`group h-10 px-3 rounded-lg border flex items-center justify-between text-sm transition
                      ${isOn ? "bg-emerald-100 border-emerald-200 text-emerald-800" : "bg-white hover:bg-gray-50"}
                    `}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span
                                                className={`inline-block w-3.5 h-3.5 rounded-full border
                          ${isOn ? "border-emerald-600 bg-emerald-600" : "border-gray-400"}
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

                <button
                    className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full border bg-white shadow hover:bg-gray-50 disabled:opacity-30 items-center justify-center"
                    onClick={() => setPage((p) => Math.min((totalPages || 1) - 1, p + 1))}
                    disabled={page + 1 >= (totalPages || 1)}
                    aria-label="다음 페이지"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* 생성/수정 모달 */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold">{editingId ? "카테고리 수정" : "카테고리 생성"}</h3>
                            <button className="text-gray-500 hover:text-gray-700" onClick={() => setModalOpen(false)}>✕</button>
                        </div>

                        <label className="text-sm block">
                            <span className="block mb-1 text-gray-600">카테고리명</span>
                            <input
                                className="w-full px-3 py-2 border rounded-lg"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) save(); }}
                                placeholder="예) 휴대폰, 노트북 등"
                                autoFocus
                            />
                        </label>

                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-40"
                                onClick={save}
                                disabled={!name.trim()}
                            >
                                저장
                            </button>
                            <button className="px-4 py-2 rounded-lg border" onClick={() => setModalOpen(false)}>취소</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}