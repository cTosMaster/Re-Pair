import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompanyRepairRequests } from "../../services/customerAPI";
import { Search, UserRound, ChevronDown } from "lucide-react";
import { fromApiToUi, fromKoToUi, segmentForStatus } from "../../routes/statusRoute";

const PAGE_SIZE = 10;

/** 드롭다운(백엔드 enum 그대로) */
const STATUS_FILTERS = [
  { label: "전체", value: "ALL" },
  { label: "수리대기", value: "WAITING_FOR_REPAIR" },
  { label: "수리중", value: "IN_PROGRESS" },
  { label: "결제대기", value: "WAITING_FOR_PAYMENT" },
  { label: "배송대기", value: "WAITING_FOR_DELIVERY" },
  { label: "배송완료", value: "COMPLETED" },
  { label: "취소", value: "CANCELED" }, // 백엔드 표기
];

/** UI 코드 → 한국어 표기 (요구사항: 취소=수리취소) */
const toKr = (ui) =>
  ({
    PENDING_APPROVAL: "접수대기",
    WAITING_FOR_REPAIR: "수리대기",
    IN_PROGRESS: "수리중",
    WAITING_FOR_PAYMENT: "결제대기",
    WAITING_FOR_DELIVERY: "배송대기",
    COMPLETED: "배송완료",
    CANCELLED: "수리취소", // ← 여기!
  }[ui] ?? ui);

/** 상태 배지 스타일 (UI 코드 기준) */
const statusPillByUi = (ui) => {
  switch (ui) {
    case "IN_PROGRESS":
      return "bg-green-700 text-white";
    case "WAITING_FOR_REPAIR":
      return "border border-green-700 text-green-700";
    case "WAITING_FOR_PAYMENT":
      return "border border-amber-500 text-amber-600";
    case "WAITING_FOR_DELIVERY":
      return "border border-sky-500 text-sky-600";
    case "CANCELLED":
      return "border border-red-500 text-red-600";
    case "COMPLETED":
      return "border border-gray-400 text-gray-600";
    default:
      return "border border-gray-300 text-gray-600";
  }
};

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

export default function MysuriCurrentList() {
  const navigate = useNavigate();

  // 목록/페이징/필터 상태
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL"); // 백엔드 enum 그대로

  // 체크 상태
  const [checked, setChecked] = useState({});
  const checkedCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);

  const mapRow = useCallback((r) => {
    const id = r.requestid ?? r.requestId ?? r.id;

    // 백엔드가 섞어서 줄 수 있음:
    // - r.statusCode: 영문 ENUM
    // - r.status: 영문 ENUM 또는 한글 라벨
    // 우선 영문 형태면 fromApiToUi, 아니면 fromKoToUi
    const rawStatus = r.statusCode ?? r.status;
    const looksLikeEnum = typeof rawStatus === "string" && /^[A-Z_]+$/.test(rawStatus);
    const uiCode = looksLikeEnum ? fromApiToUi(rawStatus) : fromKoToUi(rawStatus);

    return {
      id,
      title: r.title ?? "(제목 없음)",
      category: r.category ?? "",
      item: r.item ?? "",
      createdAt: r.createdAt ?? r.created_at,
      statusUi: uiCode,                 // 라우팅/스타일용(UI 코드)
      statusKr: toKr(uiCode),           // 표시용 한글
      userName: r.userName ?? r.user_name ?? r.name ?? "",
      userPhone: r.userPhone ?? r.contact_phone ?? r.phone ?? "",
    };
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCompanyRepairRequests({
        status, // 그대로 전달 (ALL/WAITING_FOR_REPAIR/.../CANCELED)
        page,
        size: PAGE_SIZE,
        keyword: keyword || undefined,
      });
      const data = res?.data ?? {};
      const content = data.content ?? data.items ?? data.data ?? [];
      const list = Array.isArray(content) ? content.map(mapRow) : [];
      setRows(list);
      setTotalPages(typeof data.totalPages === "number" ? data.totalPages : 0);
      setChecked({});
    } finally {
      setLoading(false);
    }
  }, [status, page, keyword, mapRow]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const pageNumbers = useMemo(() => {
    const tp = totalPages || 0;
    if (tp <= 7) return [...Array(tp)].map((_, i) => i);
    const set = new Set([0, 1, page - 1, page, page + 1, tp - 2, tp - 1].filter((n) => n >= 0 && n < tp));
    return [...set].sort((a, b) => a - b);
  }, [page, totalPages]);

  const goDetail = (row) => {
    const id = row?.id;
    if (!id) return;
    // statusRoute의 세그먼트 유틸만 사용
    const seg = segmentForStatus(row.statusUi);
    navigate(`/repair-requests/${encodeURIComponent(id)}/${seg}`);
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
      <h1 className="text-2xl font-bold text-gray-800">수리 현황 관리</h1>

      {/* 상단 검색/필터 바 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
        {/* 검색 */}
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

        {/* 상태 드롭다운 */}
        <div className="relative">
          <div className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer">
            <span className="text-sm text-gray-700">상태</span>
            <ChevronDown size={16} className="text-gray-500" />
            <select
              className="absolute inset-0 opacity-0 cursor-pointer"
              value={status}
              onChange={(e) => {
                setPage(0);
                setStatus(e.target.value);
              }}
              aria-label="상태 필터"
            >
              {STATUS_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
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

                  {/* 상태 배지 */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusPillByUi(r.statusUi)}`}>
                      {r.statusKr}
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

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={loading || page === 0}
            aria-label="이전"
          >
            &lt;
          </button>

          {pageNumbers.map((p, idx, arr) => {
            const prev = arr[idx - 1];
            const needDots = prev != null && p - prev > 1;
            return (
              <span key={`page-${p}`} className="flex">
                {needDots && <span className="px-2 py-1 text-gray-400">…</span>}
                <button
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded ${p === page ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
                >
                  {p + 1}
                </button>
              </span>
            );
          })}

          <button
            className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || (totalPages ? page + 1 >= totalPages : true)}
            aria-label="다음"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}