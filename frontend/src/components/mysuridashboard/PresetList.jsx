import { useEffect, useMemo, useState, useCallback } from "react";
import { listPresets, deletePreset } from "../../services/customerAPI";
import PresetModal from "../modal/PresetModal";
import MysuriPagination from "./MysuriPagination"; // 경로는 프로젝트에 맞게 조정

/** 기본 페이지 크기 (백엔드 Page size와 맞춰 사용) */
const DEFAULT_PAGE_SIZE = 10;

/** 가격 포맷: 20,000 */
const fmtPrice = (v) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return String(v ?? "-");
  return new Intl.NumberFormat("ko-KR").format(n);
};

/** 날짜 포맷: 2025-08-18 */
const fmtDate = (v) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/** Page 응답에서 content 안전추출 */
const pickContent = (data) =>
  Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];

/** 응답 → UI 행 매핑 (방어적으로 필드 흡수) */
const mapRow = (r) => {
  const id = r?.presetId ?? r?.id ?? r?.preset_id ?? null;
  return {
    id,
    name: r?.name ?? "(이름 없음)",
    description: r?.description ?? r?.desc ?? "",
    price: r?.price ?? 0,
    createdAt: r?.createdAt ?? r?.created_at ?? r?.createdDate ?? null,
  };
};

export default function PresetList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // 서버 페이징 상태 (스프링 Page 기반)
  const [page, setPage] = useState(0);                 // 0-base
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);     // totalElements

  // 검색(클라 필터)
  const [keyword, setKeyword] = useState("");

  // 모달
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPage = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const res = await listPresets({ page: p, size: pageSize || DEFAULT_PAGE_SIZE });
      const data = res?.data ?? {};
      const list = pickContent(data).map(mapRow);

      setRows(list);
      setPage(typeof data?.number === "number" ? data.number : p);

      // Page 메타 반영
      const sizeFromBackend = typeof data?.size === "number" ? data.size : (pageSize || DEFAULT_PAGE_SIZE);
      setPageSize(sizeFromBackend);

      const totalElements =
        typeof data?.totalElements === "number"
          ? data.totalElements
          : (typeof data?.totalPages === "number" ? data.totalPages : 0) * sizeFromBackend;
      setTotalItems(totalElements);
      
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchPage(0);
  }, [fetchPage]);

  // 검색 필터 (현재 페이지 내에서만 필터링)
  const filtered = useMemo(() => {
    if (!keyword) return rows;
    const q = keyword.trim().toLowerCase();
    return rows.filter(
      (r) =>
        String(r.name).toLowerCase().includes(q) ||
        String(r.description).toLowerCase().includes(q)
    );
  }, [rows, keyword]);

  // 삭제
  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm("해당 프리셋을 삭제할까요?");
    if (!ok) return;
    setLoading(true);
    try {
      await deletePreset(id);
      // 현재 페이지에서 모두 지워졌다면 이전 페이지로 당겨오기
      if (filtered.length <= 1 && page > 0) {
        await fetchPage(page - 1);
      } else {
        await fetchPage(page);
      }
    } finally {
      setLoading(false);
    }
  };

  // MysuriPagination은 1-base를 기대하므로 어댑터 제공
  const handlePageChange1Based = (nextPage1) => {
    const totalPagesByItems = Math.ceil((totalItems || 0) / (pageSize || DEFAULT_PAGE_SIZE));
    const clamped = Math.max(1, Math.min(nextPage1, totalPagesByItems || 1));
    fetchPage(clamped - 1); // 1-base → 0-base
  };

  return (
    <div className="w-full px-10 mt-10">
      <div className="p-10 bg-white rounded-xl shadow-md w-[1000px] mx-auto mt-10">
        {/* 제목 */}
        <h1 className="text-xl font-bold mb-6">프리셋 관리</h1>

        {/* 검색/등록 바 */}
        <div className="flex justify-between items-center mb-4">
          <input
            className="px-4 py-2 border border-gray-300 rounded-lg w-80"
            placeholder="프리셋명/설명 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-[#9fc87b] text-white"
            onClick={() => setIsModalOpen(true)}
          >
            + 프리셋 등록
          </button>
        </div>

        {/* 헤더 */}
        <div className="grid grid-cols-12 text-gray-600 text-sm border-b pb-2 mb-2">
          <div className="col-span-5 font-semibold pl-2">프리셋명</div>
          <div className="col-span-3 font-semibold">설명</div>
          <div className="col-span-2 font-semibold text-right pr-6">기본 단가</div>
          <div className="col-span-2 font-semibold text-right pr-2">등록일시 / 삭제</div>
        </div>

        {/* 리스트 */}
        {loading && rows.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-4 mb-3 animate-pulse">
              <div className="h-4 bg-gray-200 w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 w-2/3" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-gray-400">
            조회된 프리셋이 없습니다.
          </div>
        ) : (
          filtered.map((r) => (
            <div
              key={r.id ?? `${r.name}-${r.createdAt}`}
              className="grid grid-cols-12 items-center gap-2 rounded-xl border p-4 mb-3"
            >
              <div className="col-span-5 pl-2">
                <div className="font-semibold text-gray-900">{r.name}</div>
                {r.description && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {r.description}
                  </div>
                )}
              </div>

              <div className="col-span-3 text-gray-700">
                <div className="hidden sm:block text-sm line-clamp-2">
                  {r.description || "-"}
                </div>
              </div>

              <div className="col-span-2 text-right pr-6">
                <span className="font-bold">{fmtPrice(r.price)}</span>
              </div>

              {/* 등록일시(상) + 삭제(하) - 세로 배치 */}
              <div className="col-span-2 text-right pr-2 flex flex-col items-end gap-2">
                <span className="text-sm text-gray-600">{fmtDate(r.createdAt)}</span>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}

        {/* ✅ MysuriPagination 사용 */}
        <MysuriPagination
          totalItems={totalItems}
          itemsPerPage={pageSize || DEFAULT_PAGE_SIZE}
          currentPage={(page || 0) + 1}          
          onPageChange={handlePageChange1Based}
        />
      </div>

      {/* ✅ 프리셋 등록 모달 */}
      {isModalOpen && (
        <PresetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={() => {
            setIsModalOpen(false);
            fetchPage(page); // 현재 페이지 새로고침
          }}
        />
      )}
    </div>
  );
}