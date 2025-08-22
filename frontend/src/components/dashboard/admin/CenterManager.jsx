import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCustomers, deleteCustomer } from '../../../services/adminAPI'; // ← 경로 조정
import { Search, Trash2, RefreshCw, Building2, Mail, Phone, MapPin } from 'lucide-react';

const PAGE_SIZE = 10;

export default function CenterManager() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(null);
    const [hasNext, setHasNext] = useState(true);
    const [totalCount, setTotalCount] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [selected, setSelected] = useState(new Set()); // 선택된 center ids

    const fmtDate = useCallback(
        (v) => (v ? new Date(v).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-'),
        []
    );

    const mapRow = useCallback(
        (c) => ({
            id: c.customer_id ?? c.customerId ?? c.id,
            name: c.company_name ?? c.companyName ?? '이름없음',
            manager: c.contact_name ?? c.contactName ?? '',
            email: c.contact_email ?? c.contactEmail ?? '',
            phone: c.contact_phone ?? c.contactPhone ?? '',
            address: c.address ?? c.roadAddress ?? '',
            status: String(c.status ?? '').toUpperCase(),
            createdAt: c.created_at ?? c.createdAt,
            approvedAt: c.approved_at ?? c.approvedAt,
        }),
        []
    );

    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                size: PAGE_SIZE,
                status: 'APPROVED',      // 서버가 받으면 서버 필터
                sort: 'approvedAt,desc', // 없으면 아래에서 보정
            };
            const res = await getCustomers(params);
            const data = res?.data ?? {};
            const content = data.content ?? data.items ?? data.data ?? [];

            let list = Array.isArray(content) ? content.map(mapRow) : [];
            // 서버가 status/정렬 미지원 시 클라 보정
            list = list
                .filter((r) => r.status === 'APPROVED')
                .sort(
                    (a, b) =>
                        new Date(b.approvedAt ?? b.createdAt) - new Date(a.approvedAt ?? a.createdAt)
                );

            setRows(list);
            setSelected(new Set()); // 페이지 바뀔 때 선택 초기화

            // 페이징/카운트 세팅
            const tp = typeof data.totalPages === 'number' ? data.totalPages : null;
            setTotalPages(tp);
            setHasNext(tp != null ? page + 1 < tp : content.length === PAGE_SIZE); // 추정
            setTotalCount(
                data.totalElements ?? data.total ?? (tp != null ? undefined : list.length) ?? null
            );
        } catch (e) {
            console.warn('센터 목록 조회 실패:', e);
            setRows([]);
            setHasNext(false);
        } finally {
            setLoading(false);
        }
    }, [page, mapRow]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    // 검색 필터(현재 페이지 rows 기준)
    const filtered = useMemo(() => {
        if (!keyword) return rows;
        const k = keyword.toLowerCase();
        return rows.filter((r) =>
            [r.name, r.manager, r.email, r.phone, r.address].some((x) =>
                (x || '').toLowerCase().includes(k)
            )
        );
    }, [rows, keyword]);

    // 전체선택 체크 정확도
    const isAllSelected = useMemo(
        () => filtered.length > 0 && filtered.every((r) => selected.has(r.id)),
        [filtered, selected]
    );

    const toggleOne = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        setSelected(isAllSelected ? new Set() : new Set(filtered.map((r) => r.id)));
    };

    const removeOne = async (id) => {
        if (!confirm('이 센터를 삭제할까요?')) return;
        try {
            await deleteCustomer(id);
            await fetchList();
        } catch {
            alert('삭제에 실패했습니다.');
        }
    };

    const removeSelected = async () => {
        if (selected.size === 0) return;
        if (!confirm(`선택된 ${selected.size}개 센터를 삭제할까요?`)) return;
        // 순차 삭제 (백엔드가 일괄 삭제 지원하면 해당 API로 교체)
        for (const id of selected) {
            try {
                // eslint-disable-next-line no-await-in-loop
                await deleteCustomer(id);
            } catch {
                /* ignore to continue others */
                alert(`센터 ${id} 삭제에 실패했습니다.`);
            }
        }
        await fetchList();
    };

    return (
        <div className="space-y-4">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">고객 센터관리</h1>
                <button
                    onClick={fetchList}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    새로고침
                </button>
            </div>

            {/* 검색 */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        className="pl-9 pr-3 py-2 border rounded-lg text-sm w-72"
                        placeholder="센터명/담당자/이메일/전화/주소 검색"
                        value={keyword}
                        onChange={(e) => {
                            setPage(0);
                            setKeyword(e.target.value);
                        }}
                    />
                </div>
                <div className="text-sm text-gray-500">
                    총 센터 수 : {totalCount ?? rows.length}
                </div>
            </div>

            {/* 리스트 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y">
                {loading && rows.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="p-4 animate-pulse">
                            <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                            <div className="h-3 w-64 bg-gray-200 rounded" />
                        </div>
                    ))
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">표시할 센터가 없습니다.</div>
                ) : (
                    filtered.map((c) => (
                        <div key={c.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between gap-4">
                                {/* 체크박스 + 정보 */}
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="mt-2 rounded border-gray-300"
                                        checked={selected.has(c.id)}
                                        onChange={() => toggleOne(c.id)}
                                    />
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Building2 size={18} className="text-emerald-700" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{c.name}</div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            승인일 {fmtDate(c.approvedAt ?? c.createdAt)}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
                                            {c.manager && (
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="font-medium">담당</span> {c.manager}
                                                </span>
                                            )}
                                            {c.email && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Mail size={14} /> {c.email}
                                                </span>
                                            )}
                                            {c.phone && (
                                                <span className="inline-flex items-center gap-1">
                                                    <Phone size={14} /> {c.phone}
                                                </span>
                                            )}
                                            {c.address && (
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={14} /> {c.address}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 개별 삭제 */}
                                <button
                                    onClick={() => removeOne(c.id)}
                                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 inline-flex items-center gap-1"
                                >
                                    <Trash2 size={16} /> 삭제
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={isAllSelected}
                            onChange={toggleAll}
                        />
                        전체선택
                    </label>
                    <span>
                        페이지 {page + 1}
                        {totalPages != null ? ` / ${totalPages}` : ''}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={loading || page === 0}
                    >
                        이전
                    </button>
                    <button
                        className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={loading || !hasNext}
                    >
                        다음
                    </button>
                </div>
            </div>

            {/* 하단 일괄 삭제 버튼 */}
            <div className="flex justify-end">
                <button
                    onClick={removeSelected}
                    disabled={selected.size === 0}
                    className="px-4 py-2 rounded-lg bg-emerald-700 text-white disabled:opacity-40"
                >
                    센터 삭제 {selected.size > 0 ? `(${selected.size})` : ''}
                </button>
            </div>
        </div>
    );
}