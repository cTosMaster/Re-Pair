// PendingCompanyList.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getPendingCustomers,
  getCustomerDetail,
  approveCustomer,
  rejectCustomer,
} from '../../../services/adminAPI';

export default function PendingCompanyList() {
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalPages, setTotalPages] = useState(null);

  const fmtDate = useCallback((v) => {
    if (!v) return '-';
    const dt = new Date(v);
    return Number.isNaN(dt.getTime())
      ? String(v)
      : dt.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
  }, []);

  const mapRow = useCallback((c) => ({
    id: c.customerId ?? c.id,
    name: c.companyName ?? c.name ?? c.company_name,
    email: c.contactEmail ?? c.email,
    requestedAt: c.createdAt ?? c.requestedAt,
    raw: c,
  }), []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPendingCustomers({ page, size: PAGE_SIZE }); // /admin/customers/pending
      const data = res?.data ?? {};
      const content = data.content ?? data.items ?? data.data ?? [];
      const mapped = Array.isArray(content) ? content.map(mapRow) : [];
      setRows(mapped);

      // 페이징 정보 추정/사용
      if (typeof data.totalPages === 'number') {
        setTotalPages(data.totalPages);
        setHasPrev(page > 0);
        setHasNext(page + 1 < data.totalPages);
      } else {
        setTotalPages(null);
        setHasPrev(page > 0);
        setHasNext(mapped.length === PAGE_SIZE);
      }
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? '목록 조회 실패');
    } finally {
      setLoading(false);
    }
  }, [page, mapRow]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openDetail = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await getCustomerDetail(id); // /admin/customers/{id}
      setSelected(res?.data ?? null);
      setModalOpen(true);
    } catch {
      alert('상세 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApprove = useCallback(async (id) => {
    if (!confirm('이 고객사를 승인할까요?')) return;
    try {
      await approveCustomer(id); // /approve
      setModalOpen(false);
      await fetchList();
    } catch {
      alert('승인에 실패했습니다.');
    }
  }, [fetchList]);

  const handleReject = useCallback(async (id) => {
    const reason = prompt('반려 사유를 입력하세요 (선택):') || undefined;
    try {
      await rejectCustomer(id, reason ? { reason } : undefined); // /reject
      setModalOpen(false);
      await fetchList();
    } catch {
      alert('반려에 실패했습니다.');
    }
  }, [fetchList]);

  const pageLabel = useMemo(() => {
    return totalPages != null ? `${page + 1} / ${totalPages}` : `${page + 1}`;
  }, [page, totalPages]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">승인 대기 고객사 목록</h2>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 text-sm rounded border disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={!hasPrev || loading}
          >
            이전
          </button>
          <span className="text-sm text-gray-500">{pageLabel}</span>
          <button
            className="px-3 py-1 text-sm rounded border disabled:opacity-40"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNext || loading}
          >
            다음
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600">{error}</div>
      )}

      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-500 border-b">
          <tr>
            <th className="py-2">회사명</th>
            <th className="py-2">이메일</th>
            <th className="py-2">요청일</th>
            <th className="py-2 text-right">액션</th>
          </tr>
        </thead>
        <tbody>
          {loading && rows.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b animate-pulse">
                <td className="py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                <td className="py-3"><div className="h-4 w-40 bg-gray-200 rounded" /></td>
                <td className="py-3"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                <td className="py-3 text-right"><div className="h-4 w-16 bg-gray-200 rounded ml-auto" /></td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td className="py-6 text-center text-gray-500" colSpan={4}>
                승인 대기 중인 고객사가 없습니다.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="py-2 font-medium">{r.name}</td>
                <td className="py-2">{r.email}</td>
                <td className="py-2">{fmtDate(r.requestedAt)}</td>
                <td className="py-2 text-right">
                  <button
                    className="text-blue-600 hover:underline text-sm disabled:opacity-40"
                    onClick={() => openDetail(r.id)}
                    disabled={loading}
                  >
                    내용 보기
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 상세 모달 */}
      {modalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">고객사 상세</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <dl className="grid grid-cols-3 gap-4 text-sm">
              <dt className="text-gray-500">회사명</dt>
              <dd className="col-span-2">{selected.companyName ?? selected.name}</dd>

              <dt className="text-gray-500">사업자등록번호</dt>
              <dd className="col-span-2">{selected.companyNumber ?? '-'}</dd>

              <dt className="text-gray-500">담당자</dt>
              <dd className="col-span-2">{selected.contactName ?? '-'}</dd>

              <dt className="text-gray-500">이메일</dt>
              <dd className="col-span-2">{selected.contactEmail ?? selected.email ?? '-'}</dd>

              <dt className="text-gray-500">연락처</dt>
              <dd className="col-span-2">{selected.contactPhone ?? '-'}</dd>

              <dt className="text-gray-500">주소</dt>
              <dd className="col-span-2">{selected.address ?? '-'}</dd>

              <dt className="text-gray-500">요청일</dt>
              <dd className="col-span-2">{fmtDate(selected.createdAt ?? selected.requestedAt)}</dd>

              <dt className="text-gray-500">상태</dt>
              <dd className="col-span-2">{selected.status ?? 'PENDING'}</dd>

              <dt className="text-gray-500">사업자등록증</dt>
              <dd className="col-span-2">
                {selected.businessDocUrl
                  ? <a className="text-blue-600 underline" href={selected.businessDocUrl} target="_blank" rel="noreferrer">파일 열기</a>
                  : '-'}
              </dd>
            </dl>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg border"
                onClick={() => setModalOpen(false)}
              >
                닫기
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
                onClick={() => handleReject(selected.customerId ?? selected.id)}
              >
                반려
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
                onClick={() => handleApprove(selected.customerId ?? selected.id)}
              >
                승인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}