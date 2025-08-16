import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompanyRepairRequests } from "../../services/customerAPI";
import { Search, UserRound } from "lucide-react";
// 경로는 프로젝트 구조에 맞게 조정
import MysuriPagination from "./MysuriPagination";

const PAGE_SIZE = 10;
const FIXED_STATUS = "PENDING"; // 접수대기만

/** 날짜 포맷 (YYYY-MM-DD → YYYY.MM.DD) */
const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).replaceAll("-", ".");
  return d
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\s/g, "")
    .replace(/\.$/, "");
};

export default function MysuriRequestList() {
  const navigate = useNavigate();

  // 목록/페이징/검색
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0); // ← 0-based (API 전송용)
  const [totalItems, setTotalItems] = useState(0); // ← MysuriPagination용 총 아이템 수
  const [keyword, setKeyword] = useState("");

  // 체크 상태
  const [checked, setChecked] = useState({});
  const checkedCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  const mapRow = useCallback((r) => {
    const id =
      r.requestid ??
      r.requestId ??
      r.request_id ??
      r.id ??
      r.repairRequestId ??
      r.repair_request_id;

    return {
      id,
      title: r.title ?? "(제목 없음)",
      category: r.category ?? "",
      item: r.item ?? "",
      createdAt: r.createdAt ?? r.created_at,
      userName: r.userName ?? r.user_name ?? r.name ?? "",
      userPhone: r.userPhone ?? r.contact_phone ?? r.phone ?? "",
    };
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCompanyRepairRequests({
        status: FIXED_STATUS,     // 항상 접수대기만
        page,                     // 0-based
        size: PAGE_SIZE,
        keyword: keyword || undefined,
      });

      const data = res?.data ?? {};
      const content = data.content ?? data.items ?? data.data ?? [];
      const list = Array.isArray(content) ? content.map(mapRow) : [];
      setRows(list);

      // 총 개수 산정: 우선 순위 totalElements > totalCount > total_items > (totalPages * size)
      const totalPages = typeof data.totalPages === "number" ? data.totalPages : undefined;
      const totalsFromData =
        data.totalElements ?? data.totalCount ?? data.total_items ?? undefined;
      setTotalItems(
        typeof totalsFromData === "number"
          ? totalsFromData
          : totalPages
          ? totalPages * PAGE_SIZE
          : 0
      );

      setChecked({});
    } finally {
      setLoading(false);
    }
  }, [page, keyword, mapRow]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const goDetail = (row) => {
    const id = row?.id;
    if (!id) return;
    // 접수대기 상세만 사용
    navigate(`/repair-requests/${encodeURIComponent(id)}/pending-approval`);
  };

  const toggleAll = (e) => {
    const on = e.target.checked;
    const next = {};
    rows.forEach((r) => {
      if (r.id != null) next[r.id] = on;
    });
    setChecked(next);
  };

  const toggleOne = (id, on) => {
    setChecked((prev) => ({ ...prev, [id]: on }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">수리 현황 관리 (접수대기만)</h1>

      {/* 상단 검색 바 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-9 pr-3 py-2 border rounded-lg text-sm w-72"
            placeholder="Search"
            value={keyword}
            onChange={(e) => {
              setPage(0);
              setKeyword(e.target.value);
            }}
          />
        </div>
        <span className="text-sm text-gray-500">필터: 접수대기</span>
      </div>

      {/* 헤더 라인 */}
      <div className="px-6 text-xs text-gray-500 grid grid-cols-12">
        <div className="col-span-1">
          <input type="checkbox" onChange={toggleAll} aria-label="전체 선택" />
        </div>
        <div className="col-span-4">고객명</div>
        <div className="col-span-3">제목</div>
        <div className="col-span-2">수리 상태</div>
        <div className="col-span-2 text-right">요청일자</div>
      </div>

      {/* 목록 */}
      <div className="space-y-3">
        {loading && rows.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>
            ))
          : rows.length === 0
            ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-400">
                조회된 항목이 없습니다.
              </div>
            )
            : rows.map((r, i) => (
              <div key={r.id ?? `row-${r.createdAt ?? ""}-${i}`} className="bg-white rounded-2xl shadow-sm px-6 py-4">
                <div className="grid grid-cols-12 items-center gap-2">
                  {/* 체크박스 */}
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={!!checked[r.id]}
                      onChange={(e) => toggleOne(r.id, e.target.checked)}
                      disabled={!r.id}
                      aria-label={`선택 ${r.title}`}
                    />
                  </div>

                  {/* 고객명/연락처 */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserRound size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{r.userName || "-"}</div>
                      <div className="text-xs text-gray-500">{r.userPhone || "-"}</div>
                    </div>
                  </div>

                  {/* 제목/카테고리 */}
                  <div className="col-span-3">
                    <div className="font-medium text-gray-900">{r.title}</div>
                    {r.category && <span className="ml-1 text-xs text-gray-500">{r.category}</span>}
                  </div>

                  {/* 상태 배지: 고정 '접수대기' */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-amber-500 text-amber-600">
                      접수대기
                    </span>
                  </div>

                  {/* 날짜 + 상세보기 */}
                  <div className="col-span-2 flex items-center justify-end gap-3">
                    <div className="text-sm text-gray-600">{fmtDate(r.createdAt)}</div>
                    <button
                      onClick={() => goDetail(r)}
                      disabled={!r.id}
                      className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-40"
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* 하단: 삭제 버튼 + 페이지네이션 */}
      <div className="flex items-center justify-between pt-4">
        <button
          className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-40"
          disabled={checkedCount === 0}
          onClick={() => alert(`선택 ${checkedCount}건 삭제 (예시)`)}
        >
          요청 삭제
        </button>

        {/* ✅ MysuriPagination 적용 (컴포넌트는 1-based 페이지 인덱스 사용) */}
        <MysuriPagination
          totalItems={totalItems}
          itemsPerPage={PAGE_SIZE}
          currentPage={page + 1}                 // 0-based → 1-based 변환
          onPageChange={(p) => setPage(p - 1)}   // 1-based → 0-based 변환
        />
      </div>
    </div>
  );
}