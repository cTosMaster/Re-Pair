import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth'; // 위치에 맞게 경로 조정
import { jwtDecode } from 'jwt-decode';

const mask = (str = '', keepStart = 6, keepEnd = 4) => {
  if (!str) return '';
  if (str.length <= keepStart + keepEnd) return str;
  return `${str.slice(0, keepStart)}…${str.slice(-keepEnd)}`;
};

const roleNeedsCustomer = (r) =>
  ['CUSTOMER', 'ADMIN'].includes(String(r || '').toUpperCase());

export default function AuthDebugPage() {
  const { user, accessToken, isAuthenticated, loading, refetch, logout } =
    useAuth();

  const tokenMeta = useMemo(() => {
    try {
      if (!accessToken) return null;
      const d = jwtDecode(accessToken);
      const expMs = d?.exp ? d.exp * 1000 : undefined;
      return {
        sub: d?.sub,
        role:
          d?.role ||
          d?.roles?.[0] ||
          (Array.isArray(d?.authorities)
            ? typeof d.authorities[0] === 'string'
              ? d.authorities[0]
              : d.authorities[0]?.authority
            : undefined),
        customerId: d?.customerId ?? d?.customer_id ?? d?.cid,
        exp: expMs ? new Date(expMs).toLocaleString() : 'N/A',
        raw: d,
      };
    } catch {
      return { error: 'JWT decode 실패' };
    }
  }, [accessToken]);

  const payloadExample = useMemo(
    () => ({
      repairId: 123,
      orderName: '테스트 결제',
      amount: 1000,
      customerName: user?.name || user?.email || '고객',
      customerEmail: user?.email || '',
      // CUSTOMER가 아니면 포함 안 하도록 조건부 포함
      ...(user?.customerId && { customerId: user.customerId }),
    }),
    [user]
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">useAuth 테스트</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 세션 상태 */}
        <div className="rounded-2xl border p-4 bg-white">
          <h2 className="font-semibold mb-2">세션 상태</h2>
          <ul className="text-sm space-y-1">
            <li>
              <span className="text-gray-500">loading:</span>{' '}
              <b>{String(loading)}</b>
            </li>
            <li>
              <span className="text-gray-500">isAuthenticated:</span>{' '}
              <b>{String(isAuthenticated)}</b>
            </li>
            <li>
              <span className="text-gray-500">user.role:</span>{' '}
              <b>{user?.role ?? '—'}</b>
            </li>
            <li>
              <span className="text-gray-500">user.email:</span>{' '}
              <b>{user?.email ?? '—'}</b>
            </li>
            <li>
              <span className="text-gray-500">user.customerId:</span>{' '}
              <b>{user?.customerId ?? '— (USER는 없음)'}</b>
            </li>
          </ul>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => roleNeedsCustomer(user?.role) && refetch?.()}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
              disabled={loading || !roleNeedsCustomer(user?.role)}
              title={
                !roleNeedsCustomer(user?.role)
                  ? 'CUSTOMER/ADMIN에서만 필요'
                  : undefined
              }
            >
              프로필 refetch
            </button>
            <button
              onClick={() => logout?.()}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* 액세스 토큰 */}
        <div className="rounded-2xl border p-4 bg-white">
          <h2 className="font-semibold mb-2">액세스 토큰</h2>
          <div className="text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">token:</span>
              <code className="ml-2 break-all">{mask(accessToken)}</code>
            </div>
            <div className="mt-2 text-gray-500">
              만료(로컬시간):{' '}
              <b className="text-gray-800">{tokenMeta?.exp ?? 'N/A'}</b>
            </div>
            {tokenMeta?.error ? (
              <div className="mt-2 text-red-600">{tokenMeta.error}</div>
            ) : (
              <details className="mt-2">
                <summary className="cursor-pointer select-none text-sm text-gray-600">
                  JWT payload 보기
                </summary>
                <pre className="mt-2 overflow-auto text-xs bg-gray-50 p-2 rounded-lg">
                  {JSON.stringify(tokenMeta?.raw, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>

      {/* 결제 요청 페이로드 예시 */}
      <div className="rounded-2xl border p-4 bg-white">
        <h2 className="font-semibold mb-2">결제 요청 페이로드 예시</h2>
        <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
          {JSON.stringify(payloadExample, null, 2)}
        </pre>
        <div className="mt-2">
          <button
            onClick={() =>
              navigator.clipboard.writeText(JSON.stringify(payloadExample))
            }
            className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            클립보드로 복사
          </button>
        </div>
      </div>

      {/* user 전체 */}
      <div className="rounded-2xl border p-4 bg-white">
        <h2 className="font-semibold mb-2">user 전체</h2>
        <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}