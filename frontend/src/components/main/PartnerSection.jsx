import { useEffect, useMemo, useState, useCallback } from "react";
import centerImg from "../../assets/center_img.png";
import FilterModal from "../modal/FilterModal";
import { getCustomers as fetchCustomersAPI, getCustomerCategories } from "../../services/centerAPI";
import { listRepairItems } from "../../services/customerAPI";
import { getCategories as fetchPlatformCategories } from "../../services/adminAPI";
import KR_REGIONS from "../../constants/regions.kr";
import { useNavigate } from "react-router-dom";

/* ---------------------- 지역 매칭 유틸 ---------------------- */
// 접미사 제거 + 공백무시로 느슨하게 비교("강원", "강원특별자치도" 둘 다 OK)
const SIDO_SUFFIXES = ["특별자치도", "특별시", "광역시", "자치시", "자치도", "도", "시"];
const SIG_SUFFIXES = ["특별자치시", "시", "군", "구"];
const normalize = (s) => (s || "").replace(/\s+/g, "").toLowerCase();
const variants = (name) => {
  const n = normalize(name);
  const out = new Set([n]);
  [...SIDO_SUFFIXES, ...SIG_SUFFIXES].forEach((suf) => {
    if (n.endsWith(suf)) out.add(n.slice(0, -suf.length));
  });
  return Array.from(out);
};
/** regionLabel이 '강원 삼척시'여도 token OR, 접미사 무시 */
const matchesRegion = (addr, regionLabel) => {
  const A = normalize(addr);
  const tokens = (regionLabel || "").trim().split(/\s+/).filter(Boolean);
  return tokens.some((tk) => variants(tk).some((v) => A.includes(v)));
};

export default function PartnerSection() {
  // 필터/검색
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState([]);     // ["강원특별자치도","삼척시"] 등
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

  // 검색: draft vs 실제 keyword
  const [draftKeyword, setDraftKeyword] = useState("");
  const [keyword, setKeyword] = useState("");

  // 페이징(확장 대비)
  const [page, setPage] = useState(0);
  const [size] = useState(12);

  // 데이터
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 고객사별 카테고리 캐시
  const [catMap, setCatMap] = useState({});     // { [customerId]: ['휴대폰','TV',...] }
  const [catLoaded, setCatLoaded] = useState({});

  // 플랫폼 전체 카테고리(관리자 API 성공 시 우선 사용)
  const [platformCategories, setPlatformCategories] = useState([]);

  // 모달 내부까지 초기화하려는 리마운트 키
  const [resetKey, setResetKey] = useState(0);

  /* --------------------- 검색/입력 --------------------- */
  const handleSearch = useCallback(() => {
    setPage(0);
    setKeyword(draftKeyword.trim()); // 엔터/버튼 눌러야 반영
  }, [draftKeyword]);

  const onChangeKeyword = (e) => {
    const val = e.target.value;
    setDraftKeyword(val);
    if (val === "") {
      // 비워지면 자동 전체 로드
      setPage(0);
      setKeyword("");
    }
  };

  /* --------------------- 데이터 로드 --------------------- */
  const fetchCategoryNames = useCallback(async (customerId) => {
    // 1) 공식: 고객사 카테고리(centerAPI)
    try {
      const cr = await getCustomerCategories(customerId);
      const names = Array.isArray(cr?.data) ? cr.data.map((x) => x?.name).filter(Boolean) : [];
      if (names.length) return names.slice(0, 8);
    } catch { /* fall through */ }
    // 2) 폴백: 고객사 보유 수리물품에서 카테고리 유추(customerAPI)
    try {
      const ir = await listRepairItems({ page: 0, size: 50, customerId });
      const items = ir?.data?.content ?? ir?.data ?? [];
      const s = new Set();
      items.forEach((it) => {
        const n = it?.categoryName || it?.category?.name;
        if (n) s.add(n);
      });
      return Array.from(s).slice(0, 8);
    } catch {
      return [];
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCustomersAPI({ page, size, keyword: keyword || undefined });
      const { content = [] } = res?.data || {};
      setCustomers(content);

      // 보이는 고객사의 카테고리 동시 로드(미로드 대상만)
      const targets = content.filter((c) => !catLoaded[c.id]);
      if (targets.length) {
        const pairs = await Promise.allSettled(
          targets.map(async (c) => [c.id, await fetchCategoryNames(c.id)])
        );
        const nextCat = {};
        const nextLoaded = {};
        pairs.forEach((p) => {
          if (p.status === "fulfilled") {
            const [cid, names] = p.value;
            nextCat[cid] = names || [];
            nextLoaded[cid] = true;
          }
        });
        setCatMap((prev) => ({ ...prev, ...nextCat }));
        setCatLoaded((prev) => ({ ...prev, ...nextLoaded }));
      }
    } catch (e) {
      setError(e?.message || "센터 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, catLoaded, fetchCategoryNames]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  // 플랫폼 카테고리 1회 로드
  const loadPlatformCategories = useCallback(async () => {
    try {
      const res = await fetchPlatformCategories(); // 권한 없으면 에러 → 폴백 사용
      const arr = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
      const names = arr.map((x) => x?.name).filter(Boolean);
      setPlatformCategories(names);
    } catch { /* ignore */ }
  }, []);
  useEffect(() => { loadPlatformCategories(); }, [loadPlatformCategories]);

  /* --------------------- 필터링 --------------------- */
  const filtered = useMemo(() => {
    const regionOk = (addr) =>
      selectedRegions.length === 0 ||
      selectedRegions.some((r) => matchesRegion(addr, r));

    const catOk = (cid) =>
      selectedCategories.length === 0 ||
      (catMap[cid] || []).some((name) => selectedCategories.includes(name));

    return customers.filter((c) => {
      const addrText =
        c?.address?.roadAddress ||
        c?.address?.jibunAddress ||
        c?.address?.detailAddress ||
        "";
      return regionOk(addrText) && catOk(c?.id);
    });
  }, [customers, selectedRegions, selectedCategories, catMap]);

  /* --------------------- 슬라이더 --------------------- */
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;
  const gapSize = 1.5;
  useEffect(() => setStartIndex(0), [filtered.length]);

  /* --------------------- 모달 후보 --------------------- */
  const catFromMap = useMemo(() => {
    const s = new Set();
    Object.values(catMap).forEach((arr) => (arr || []).forEach((n) => s.add(n)));
    return Array.from(s);
  }, [catMap]);
  const categoryCandidates =
    platformCategories.length ? platformCategories :
      (catFromMap.length ? catFromMap : ["휴대폰", "소형가전", "컴퓨터", "프린터", "TV", "가전", "에어컨"]);

  return (
    <section className="py-16 px-6 bg-green-100">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">제휴 A/S 센터</h2>

      {/* 검색 + 필터 바 */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="search"
            value={draftKeyword}
            onChange={onChangeKeyword}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="센터명 검색"
            className="w-full md:w-80 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
          >
            검색
          </button>
        </div>

        <div className="flex items-center gap-2 justify-between md:justify-end">
          <div className="flex flex-wrap gap-2">
            {selectedRegions.map((r) => (
              <span key={r} className="px-2.5 py-1 rounded-full text-sm bg-green-50 border border-green-200">{r}</span>
            ))}
            {selectedCategories.map((c) => (
              <span key={c} className="px-2.5 py-1 rounded-full text-sm bg-emerald-50 border border-emerald-200">{c}</span>
            ))}
            {selectedRegions.length + selectedCategories.length === 0 && (
              <span className="text-sm text-gray-400">필터가 없습니다</span>
            )}
          </div>

          {(selectedRegions.length + selectedCategories.length > 0) && (
            <button
              className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
              onClick={() => {
                // 검색/필터 전부 리셋 + 모달 내부 상태 초기화
                setSelectedRegions([]);
                setSelectedCategories([]);
                setDraftKeyword("");
                setKeyword("");
                setPage(0);
                setResetKey((k) => k + 1); // FilterModal 강제 리마운트
              }}
            >
              초기화
            </button>
          )}
          <button
            className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => setOpenFilter(true)}
          >
            필터
          </button>
        </div>
      </div>

      {/* 로딩/에러 */}
      {loading && <div className="max-w-6xl mx-auto text-center text-gray-500 py-8">불러오는 중...</div>}
      {error && <div className="max-w-6xl mx-auto text-center text-red-600 py-6">{error}</div>}

      {/* 슬라이더 */}
      {!loading && !error && filtered.length > 0 && (
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={() => setStartIndex((p) => (p - 1 + filtered.length) % filtered.length)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-green-200 shadow-md backdrop-blur-sm transition"
            aria-label="previous"
          >◀</button>

          <div className="overflow-hidden w-full">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${startIndex * (100 / visibleCount)}%)` }}
            >
              {filtered.map((c, idx) => {
                const tags = catMap[c.id] || [];
                const addr =
                  c?.address?.roadAddress ||
                  c?.address?.jibunAddress ||
                  c?.address?.detailAddress ||
                  "-";
                return (
                  <div key={`${c.id}-${idx}`} className="flex-shrink-0"
                    style={{ width: `calc((100% - ${gapSize * (visibleCount - 1)}rem) / ${visibleCount})` }}>
                    <div
                      className="bg-white rounded-xl shadow overflow-hidden cursor-pointer hover:shadow-lg transition"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        navigate(`/customers/${c.id}`, {
                          state: {
                            companyName: c.companyName,
                            address: addr,
                            openingHours: c.openingHours || "",
                            categories: tags
                          }
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/customers/${c.id}`, {
                            state: {
                              companyName: c.companyName,
                              address: addr,
                              openingHours: c.openingHours || "",
                              categories: tags
                            }
                          });
                        }
                      }}
                    >
                      <img src={centerImg} alt={c.companyName || "A/S센터"} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-1">{c.companyName}</h3>
                        <p className="text-sm text-gray-700 mb-1">
                          {(c.openingHours && `영업시간 ${c.openingHours}`) || "신속하고 정확한 수리 서비스를 제공합니다."}
                        </p>
                        <p className="text-xs text-gray-500">{addr}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tags.length === 0 && (
                            <span className="px-2 py-0.5 text-[11px] rounded-full bg-gray-50 border text-gray-400">카테고리 준비중</span>
                          )}
                          {tags.map((t) => (
                            <span key={t} className="px-2 py-0.5 text-[11px] rounded-full bg-gray-50 border">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setStartIndex((p) => (p + 1) % filtered.length)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-green-200 shadow-md backdrop-blur-sm transition"
            aria-label="next"
          >▶</button>
        </div>
      )}

      {/* 비어있을 때 */}
      {!loading && !error && filtered.length === 0 && (
        <div className="max-w-6xl mx-auto text-center text-gray-500 py-8">조건에 맞는 센터가 없습니다.</div>
      )}

      {/* 필터 모달 */}
      <FilterModal
        key={`filter-${resetKey}`}
        open={openFilter}
        onClose={() => setOpenFilter(false)}
        onApply={({ regions, categories }) => {
          setSelectedRegions(regions);      // 예: ["강원특별자치도","삼척시"]
          setSelectedCategories(categories);
          setOpenFilter(false);
          setStartIndex(0);
        }}
        currentRegions={selectedRegions}
        currentCategories={selectedCategories}
        regionCandidates={KR_REGIONS}
        categoryCandidates={categoryCandidates}
      />
    </section>
  );
}