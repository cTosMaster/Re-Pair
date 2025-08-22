import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUsers, updateUser, deleteUser } from '../../../services/adminAPI';
import { uploadFile } from '../../../services/fileAPI';
import { Search, Edit3, Trash2, RefreshCw, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';

const PAGE_SIZE = 10;
const ROLES = ['ALL', 'ADMIN', 'CUSTOMER', 'ENGINEER', 'USER'];

/* ===== 스크립트 로더 ===== */
const loadScriptOnce = (src, id) =>
  new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) return resolve(true);
    const s = document.createElement('script');
    if (id) s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = reject;
    document.head.appendChild(s);
  });

const ensureDaumPostcode = () =>
  window.daum?.Postcode
    ? Promise.resolve(true)
    : loadScriptOnce(
        'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js',
        'daum-postcode-sdk'
      );

/* Kakao Maps services 로더 (지오코딩) */
const loadKakaoIfNeeded = () =>
  new Promise((resolve, reject) => {
    if (window.kakao?.maps?.services) return resolve(true);
    if (window.kakao?.maps?.load) return window.kakao.maps.load(() => resolve(true));
    const id = 'kakao-maps-sdk';
    let s = document.getElementById(id);
    const onReady = () => {
      if (window.kakao?.maps?.load) window.kakao.maps.load(() => resolve(true));
      else reject(new Error('kakao.maps.load not available'));
    };
    if (!s) {
      s = document.createElement('script');
      s.id = id;
      s.async = true;
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_JS_KEY}&autoload=false&libraries=services`;
      s.onerror = reject;
      document.head.appendChild(s);
    }
    s.addEventListener('load', onReady, { once: true });
  });

export default function AdminAccountManager() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(null);

  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState('ALL');

  const [editOpen, setEditOpen] = useState(false);
  // editing: 백엔드 업데이트 폼과 일치
  const [editing, setEditing] = useState(null);
  // 프로필 업로드 상태
  const [profileUpload, setProfileUpload] = useState({ uploading: false, progress: 0, fileName: '', error: null });

  useEffect(() => {
    // 주소 팝업 로더 미리
    ensureDaumPostcode().catch(() => {});
    loadKakaoIfNeeded().catch(() => {});
  }, []);

  const fmtDate = useCallback(
    (v) => (v ? new Date(v).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '-'),
    []
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
        role: role === 'ALL' ? undefined : role,
        q: keyword || undefined,
        keyword: keyword || undefined,
      };
      const res = await getUsers(params);
      const data = res?.data ?? {};
      const content = data.content ?? data.items ?? data.data ?? [];
      setRows(Array.isArray(content) ? content : []);
      setTotalPages(typeof data.totalPages === 'number' ? data.totalPages : null);
    } catch (e) {
      console.warn('사용자 목록 조회 실패:', e?.message);
      setRows([]);
      setTotalPages(null);
    } finally {
      setLoading(false);
    }
  }, [page, role, keyword]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filteredRows = useMemo(() => {
    let r = rows;
    if (keyword) {
      const k = keyword.toLowerCase();
      r = r.filter(
        (u) =>
          (u.email || '').toLowerCase().includes(k) ||
          (u.name || '').toLowerCase().includes(k) ||
          (u.phone || '').toLowerCase().includes(k)
      );
    }
    if (role !== 'ALL') r = r.filter((u) => String(u.role).toUpperCase() === role);
    return r;
  }, [rows, keyword, role]);

  const onOpenEdit = (u) => {
    // 목록 응답에 없는 필드는 빈값으로 시작
    setEditing({
      id: u.id,
      name: u.name || '',
      phone: u.phone || '',
      role: u.role || 'USER',
      imageUrl: u.imageUrl || u.image_url || '',
      active: typeof u.active === 'boolean' ? u.active : true,

      postalCode: u.postalCode || '',
      roadAddress: u.roadAddress || '',
      detailAddress: u.detailAddress || '',
      lat: typeof u.lat === 'number' ? u.lat : null,
      lng: typeof u.lng === 'number' ? u.lng : null,
    });
    setProfileUpload({ uploading: false, progress: 0, fileName: '', error: null });
    setEditOpen(true);
  };

  const openPostcode = async () => {
    try {
      await ensureDaumPostcode();
      new window.daum.Postcode({
        oncomplete: async (data) => {
          const road = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
          setEditing((s) => ({
            ...s,
            postalCode: data.zonecode || '',
            roadAddress: road || '',
            // detailAddress는 그대로 유지
          }));

          // 지오코딩
          try {
            await loadKakaoIfNeeded();
            const geocoder = new window.kakao.maps.services.Geocoder();

            // 1차: 전체 주소
            geocoder.addressSearch(road, (results, status) => {
              if (status === window.kakao.maps.services.Status.OK && results?.[0]) {
                const { x, y } = results[0];
                setEditing((s) => ({ ...s, lat: +y, lng: +x }));
              } else {
                // 2차: 시/군/구 폴백
                const fallback = `${data.sido || ''} ${data.sigungu || ''}`.trim();
                if (!fallback) return;
                geocoder.addressSearch(fallback, (res2, st2) => {
                  if (st2 === window.kakao.maps.services.Status.OK && res2?.[0]) {
                    const { x, y } = res2[0];
                    setEditing((s) => ({ ...s, lat: +y, lng: +x }));
                  }
                });
              }
            });
          } catch (e) {
            console.warn('지오코딩 실패:', e);
          }
        },
      }).open();
    } catch {
      alert('주소검색 로딩중입니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleProfilePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileUpload({ uploading: true, progress: 0, fileName: file.name, error: null });
    try {
      const { url } = await uploadFile(file, {
        onProgress: (pct) =>
          setProfileUpload((s) => ({ ...s, progress: typeof pct === 'number' ? pct : s.progress })),
      });
      setEditing((s) => ({ ...s, imageUrl: url || '' }));
      setProfileUpload((s) => ({ ...s, uploading: false, progress: 100 }));
    } catch (err) {
      console.error(err);
      setProfileUpload({ uploading: false, progress: 0, fileName: '', error: '업로드에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      e.target.value = '';
    }
  };

  const onSaveEdit = async () => {
    try {
      await updateUser(editing.id, {
        name: editing.name,
        phone: editing.phone,
        imageUrl: editing.imageUrl || null,
        active: !!editing.active,
        postalCode: editing.postalCode || null,
        roadAddress: editing.roadAddress || null,
        detailAddress: editing.detailAddress || null,
        lat: typeof editing.lat === 'number' ? editing.lat : null,
        lng: typeof editing.lng === 'number' ? editing.lng : null,
      });
      setEditOpen(false);
      await fetchList();
    } catch {
      alert('수정에 실패했습니다.');
    }
  };

  const deleteAccount = async (u) => {
    if (!confirm('정말 삭제하시겠어요? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await deleteUser(u.id);
      await fetchList();
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">계정 관리</h1>
        <button
          onClick={fetchList}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 text-sm"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64"
              placeholder="이메일/이름/전화로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="px-3 py-2 border rounded-lg text-sm"
            value={role}
            onChange={(e) => {
              setPage(0);
              setRole(e.target.value);
            }}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r === 'ALL' ? '전체 역할' : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">사용자</th>
              <th className="px-4 py-3 text-left">연락처</th>
              <th className="px-4 py-3 text-left">역할</th>
              <th className="px-4 py-3 text-left">가입일</th>
              <th className="px-4 py-3 text-right">액션</th>
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-t">
                    <td className="px-4 py-4"><div className="h-4 w-48 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-20 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                    <td className="px-4 py-4 text-right"><div className="h-8 w-24 bg-gray-200 rounded ml-auto" /></td>
                  </tr>
                ))
              : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">표시할 계정이 없습니다.</td>
                  </tr>
                ) : (
                  filteredRows.map((u) => (
                    <tr key={u.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            {u.image_url ? <img src={u.image_url} alt="" className="w-full h-full object-cover" /> : null}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{u.name}</div>
                            <div className="text-gray-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{fmtDate(u.created_at || u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenEdit(u)}
                            className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1"
                            disabled={loading}
                          >
                            <Edit3 size={16} />
                            수정
                          </button>
                          <button
                            onClick={() => deleteAccount(u)}
                            className="px-3 py-1.5 rounded-lg inline-flex items-center gap-1 bg-red-600 text-white hover:bg-red-700"
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          페이지 {page + 1}
          {totalPages != null ? ` / ${totalPages}` : ''}
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
            disabled={loading || (totalPages != null && page + 1 >= totalPages)}
          >
            다음
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">계정 수정</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setEditOpen(false)}>✕</button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* 이름 */}
              <label className="text-sm">
                <span className="block mb-1 text-gray-600">이름</span>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={editing.name}
                  onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
                />
              </label>

              {/* 전화번호 */}
              <label className="text-sm">
                <span className="block mb-1 text-gray-600">전화번호</span>
                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  value={editing.phone}
                  onChange={(e) => setEditing((s) => ({ ...s, phone: e.target.value }))}
                />
              </label>

              {/* 활성화 */}
              <label className="text-sm inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!editing.active}
                  onChange={(e) => setEditing((s) => ({ ...s, active: e.target.checked }))}
                />
                <span className="text-gray-700">활성화</span>
              </label>

              {/* 프로필 이미지 업로드 */}
              <div className="text-sm">
                <span className="block mb-1 text-gray-600">프로필 이미지</span>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                    {editing.imageUrl ? (
                      <img src={editing.imageUrl} alt="profile" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer">
                    <UploadCloud className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">파일 선택</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePick} />
                  </label>
                </div>
                {profileUpload.fileName && !profileUpload.uploading && !profileUpload.error && (
                  <div className="text-xs text-emerald-700 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{profileUpload.fileName} 업로드 완료</span>
                  </div>
                )}
                {profileUpload.uploading && (
                  <>
                    <div className="text-xs text-gray-600 inline-flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>업로드 중... {Math.round(profileUpload.progress)}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-100 rounded h-2 overflow-hidden">
                      <div
                        className="h-2 bg-emerald-500 transition-all"
                        style={{ width: `${Math.round(profileUpload.progress)}%` }}
                      />
                    </div>
                  </>
                )}
                {profileUpload.error && (
                  <div className="text-xs text-rose-600">{profileUpload.error}</div>
                )}
              </div>

              {/* 주소 */}
              <div className="text-sm">
                <span className="block mb-1 text-gray-600">주소</span>

                <div className="flex gap-2 mb-2">
                  <input
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="우편번호"
                    value={editing.postalCode || ''}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={openPostcode}
                    className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50"
                  >
                    주소검색
                  </button>
                </div>

                <input
                  className="w-full px-3 py-2 border rounded-lg mb-2"
                  placeholder="도로명 주소"
                  value={editing.roadAddress || ''}
                  readOnly
                />

                <input
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="상세주소 (동/호수 등)"
                  value={editing.detailAddress || ''}
                  onChange={(e) => setEditing((s) => ({ ...s, detailAddress: e.target.value }))}
                />

                <div className="mt-2 text-xs text-gray-500">
                  lat: {editing.lat ?? '-'} / lng: {editing.lng ?? '-'}
                </div>
              </div>

              {/* 역할 */}
              <label className="text-sm">
                <span className="block mb-1 text-gray-600">역할</span>
                <select
                  className="w-full px-3 py-2 border rounded-lg"
                  value={editing.role}
                  onChange={(e) => setEditing((s) => ({ ...s, role: e.target.value }))}
                >
                  {ROLES.filter((r) => r !== 'ALL').map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setEditOpen(false)}>취소</button>
              <button
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-60"
                onClick={onSaveEdit}
                disabled={profileUpload.uploading}
              >
                {profileUpload.uploading ? '이미지 업로드 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}