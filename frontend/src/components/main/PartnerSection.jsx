import { useState, useEffect, useCallback } from "react";
import centerImg from "../../assets/center_img.png";
import { listCustomerCards } from "../../services/customerAPI";
import { useNavigate } from "react-router-dom";
import RegionSelectModal from "../../pages/companylist/RegionSelectModal";

export default function PartnerSection() {
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null); // { id, name }

  const navigate = useNavigate();

  // 검색
  const [draftKeyword, setDraftKeyword] = useState("");
  const [keyword, setKeyword] = useState("");

  // 데이터
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** API 호출 */
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    let regionSi = null;
    let regionGu = null;
    if (selectedRegion) {
      const parts = selectedRegion.split(" ");
      regionSi = parts[0];
      regionGu = parts[1] || "";
    }

    const params = {
      page: 0,
      size: 1000,
      ...(regionSi && { regionSi }),
      ...(regionGu && { regionGu }),
      ...(selectedCategory?.id && { platformCategoryId: selectedCategory.id }),
      ...(keyword && { keyword }),
    };

    try {
      const res = await listCustomerCards(params);
      setCustomers(res?.data?.content || []);
    } catch (e) {
      setError(e?.message || "센터 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [keyword, selectedRegion, selectedCategory]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSearch = () => {
    setKeyword(draftKeyword.trim());
  };

  /* --------------------- 슬라이더 --------------------- */
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;
  const gapSize = 1.5;

  useEffect(() => setStartIndex(0), [customers.length]);

  return (
    <section className="py-16 px-6 bg-green-100">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
        제휴 A/S 센터
      </h2>

      {/* 검색 + 필터 */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="search"
            value={draftKeyword}
            onChange={(e) => setDraftKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
          <div className="flex flex-wrap gap-2 text-sm">
            {selectedRegion && (
              <span className="px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                {selectedRegion}
              </span>
            )}
            {selectedCategory && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                {selectedCategory.name}
              </span>
            )}
            {!selectedRegion && !selectedCategory && (
              <span className="text-gray-400">필터가 없습니다</span>
            )}
          </div>

          {(selectedRegion || selectedCategory) && (
            <button
              className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
              onClick={() => {
                setSelectedRegion(null);
                setSelectedCategory(null);
                setKeyword("");
                setDraftKeyword("");
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
      {loading && (
        <div className="max-w-6xl mx-auto text-center text-gray-500 py-8">
          불러오는 중...
        </div>
      )}
      {error && (
        <div className="max-w-6xl mx-auto text-center text-red-600 py-6">
          {error}
        </div>
      )}

      {/* 슬라이더 */}
      {!loading && !error && customers.length > 0 && (
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-4">
          <button
            onClick={() =>
              setStartIndex((p) => (p - 1 + customers.length) % customers.length)
            }
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-green-200 shadow-md backdrop-blur-sm transition"
            aria-label="previous"
          >
            ◀
          </button>

          <div className="overflow-hidden w-full">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${startIndex * (100 / visibleCount)}%)`,
              }}
            >
              {customers.map((c, idx) => {
                const addr = c.region || "-";
                return (
                  <div
                    key={`${c.customerId}-${idx}`}
                    className="flex-shrink-0"
                    style={{
                      width: `calc((100% - ${gapSize * (visibleCount - 1)}rem) / ${visibleCount})`,
                    }}
                  >
                    <div
                      className="bg-white rounded-xl shadow overflow-hidden cursor-pointer hover:shadow-lg transition"
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(`/customers/${c.customerId}`, {
                          state: {
                            companyName: c.companyName,
                            address: addr,
                          },
                        })
                      }
                    >
                      <img
                        src={centerImg}
                        alt={c.companyName || "A/S센터"}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-xl font-semibold mb-1">
                          {c.companyName}
                        </h3>
                        {/* 별 + 숫자 평점 */}
                        <div className="flex items-center mb-1">
                          <span className="text-yellow-400 text-sm">★</span>
                          <span className="ml-1 text-sm text-gray-700">
                            {c.avgRating?.toFixed(1) ?? "0.0"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{addr}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setStartIndex((p) => (p + 1) % customers.length)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-green-200 shadow-md backdrop-blur-sm transition"
            aria-label="next"
          >
            ▶
          </button>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="max-w-6xl mx-auto text-center text-gray-500 py-8">
          조건에 맞는 센터가 없습니다.
        </div>
      )}

      {/* RegionSelectModal */}
      {openFilter && (
        <RegionSelectModal
          defaultRegion={selectedRegion}
          defaultCategory={selectedCategory}
          onClose={() => setOpenFilter(false)}
          onSelect={({ region, category }) => {
            setSelectedRegion(region);
            setSelectedCategory(category);
          }}
        />
      )}
    </section>
  );
}