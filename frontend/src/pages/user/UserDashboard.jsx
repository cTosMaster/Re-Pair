import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRepairRequests } from '../../services/userAPI'; // 경로 조정
import { Search, UserRound } from 'lucide-react';
import { fromKoToUi, segmentForStatus } from '../../routes/statusRoute'; // ✅ 추가

const PAGE_SIZE = 10;

export default function UserDashboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(null);
  const [keyword, setKeyword] = useState('');

  const fmtDate = useCallback(
    (v) => (v ? new Date(v).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-'),
    []
  );

  console.log(rows);

  // ✅ 상태 기반으로 해당 단계 경로로 이동
  const goDetail = (r) => {
    const id = r?.id;
    if (!id) return;
    const seg = segmentForStatus(r.statusUi || 'PENDING_APPROVAL');
    navigate(`/repair-requests/${encodeURIComponent(id)}/${seg}`);
  };

  // 응답값 변수에 담기
  const mapRow = useCallback(
    (r) => ({
      // ✅ ID 매핑 강화 (백엔드: requestid 소문자)
      id: r.requestid ?? r.requestId ?? r.request_id ?? r.id ?? null,
      // ✅ 한글 상태 → UI 코드 (예: '수리대기' → 'WAITING_FOR_REPAIR')
      statusUi: fromKoToUi(r.status),
      title: r.title ?? '(제목 없음)',
      category: r.category ?? '(카테고리 없음)',
      createdAt: r.createdAt ?? '(생성일 없음)',
      name: r.userName ?? '(유저명 없음)',
      phone: r.userPhone ?? '(폰번호 없음)',
    }),
    []
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyRepairRequests({
        statusGroup: 'IN_PROGRESS', // 진행중 묶음
        page,
        size: PAGE_SIZE,
        keyword: keyword || undefined,
      });
      const data = res?.data ?? {};
      const content = data.content ?? data.items ?? data.data ?? [];
      const list = Array.isArray(content) ? content.map(mapRow) : [];

      setRows(list);
      const tp = typeof data.totalPages === 'number' ? data.totalPages : null;
      setTotalPages(tp);
      setHasNext(tp != null ? page + 1 < tp : content.length === PAGE_SIZE); // 추정
    } finally {
      setLoading(false);
    }
  }, [page, keyword, mapRow]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // 페이지 번호(숫자 버튼) 계산
  const pageNumbers = useMemo(() => {
    if (totalPages != null) return [...Array(totalPages)].map((_, i) => i);
    const start = Math.max(0, page - 2);
    return [...Array(5)].map((_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">진행중인 수리</h1>

      {/* 검색 */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-9 pr-3 py-2 border rounded-lg text-sm w-72"
            placeholder="제목/카테고리/전화로 검색"
            value={keyword}
            onChange={(e) => {
              setPage(0);
              setKeyword(e.target.value);
            }}
          />
        </div>
      </div>

      {/* 헤더 라인 */}
      <div className="px-6 text-xs text-gray-500 grid grid-cols-12">
        <div className="col-span-4">이름</div>
        <div className="col-span-6">제목</div>
        <div className="col-span-2 text-right">요청 날짜</div>
      </div>

      {/* 목록 */}
      <div className="space-y-3">
        {loading && rows.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>
            ))
          : rows.length === 0
          ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-400">
              진행중인 수리가 없습니다.
            </div>
          )
          : rows.map((r, i) => (
              <div
                key={r.id ?? `row-${r.createdAt ?? ''}-${i}`}
                className="bg-white rounded-xl shadow-sm px-6 py-4"
              >
                <div className="grid grid-cols-12 items-center">
                  {/* 이름/연락처 */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserRound size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{r.name || '-'}</div>
                      <div className="text-xs text-gray-500">{r.phone || '-'}</div>
                    </div>
                  </div>

                  {/* 제목 */}
                  <div className="col-span-6">
                    <div className="font-medium text-gray-900">{r.title}</div>
                    {r.category && <span className="ml-1 text-xs text-gray-500">({r.category})</span>}
                  </div>

                  {/* 날짜 + 상세보기 */}
                  <div className="col-span-2 flex items-center justify-end gap-3">
                    <div className="text-sm text-gray-600">{fmtDate(r.createdAt)}</div>
                    <button
                      onClick={() => goDetail(r)}
                      disabled={!r.id}
                      className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <button
          className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={loading || page === 0}
          aria-label="이전"
        >
          &lt;
        </button>

        {pageNumbers.map((p) => (
          <button
            key={`page-${p}`}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded ${p === page ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`}
          >
            {p + 1}
          </button>
        ))}

        <button
          className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
          onClick={() => setPage((p) => p + 1)}
          disabled={loading || !hasNext}
          aria-label="다음"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}