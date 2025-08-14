import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getCustomerById } from "../../services/centerAPI";
import { listRepairItems, getReviewsByCustomer } from "../../services/customerAPI";
import { getCustomerAverageRating } from "../../services/statsAPI";

// ✅ 추가: 디폴트 센터 이미지 + 수리신청 모달
import centerImg from "../../assets/center_img.png";
import RepairRequestModal from "../../components/modal/RepairRequestModal";
import CustomerHeader from "../../layouts/CustomerHeader";

export default function CustomerSalesPage() {
  const { customerId } = useParams();
  const location = useLocation();

  // 네비게이션에서 넘어온 선행 데이터(있으면 초기 페인트에 사용)
  const pre = (location.state || {});
  const [company, setCompany] = useState({
    name: pre.companyName || "",
    address: pre.address || "",
    openingHours: pre.openingHours || "",
    contactName: "",
    contactPhone: "",
    imageUrl: "",
  });
  const [categories, setCategories] = useState(pre.categories || []);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(undefined);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // ✅ 수리신청 모달
  const [openModal, setOpenModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // 1) 회사 상세
      const c = await getCustomerById(customerId);
      const d = c?.data || {};
      const addr =
        d?.address?.roadAddress ||
        d?.address?.jibunAddress ||
        d?.address?.detailAddress ||
        "";
      setCompany((prev) => ({
        ...prev,
        name: d.companyName || prev.name,
        address: addr || prev.address,
        openingHours: d.openingHours || prev.openingHours,
        contactName: d.contactName || "",
        contactPhone: d.contactPhone || "",
      }));

      // 2) 수리 가능 항목(가격) — 고객사 기준 (비페이징)
      let mapped = [];
      try {
        const ir = await listRepairItems(customerId); // ✅ 단순 URL 호출
        const arr = ir?.data ?? [];
        mapped = arr.map((it) => ({
          id: it.id ?? it.itemId,
          name: it.name,
          category: it?.categoryName || it?.category?.name || "-",
          price: it.price ?? 0,
        }));
        setItems(mapped);

        // ✅ 아이템에서 카테고리 추출(중복 제거)
        const catList = [...new Set(mapped.map((it) => it.category).filter(Boolean))];
        setCategories(catList);
      } catch {
        setItems([]);
        setCategories([]);
      }

      // 3) 고객 후기
      let reviewsArr = [];
      try {
        const rv = await getReviewsByCustomer(customerId, { page: 0, size: 10 });
        const arr = rv?.data?.content ?? rv?.data ?? [];
        reviewsArr = arr.map((r) => ({
          id: r.id,
          username: r.username || r.userName || "익명",
          rating: r.rating ?? r.score ?? 0,
          content: r.content || r.comment || "",
          createdAt: r.createdAt?.slice?.(0, 10) || ""
        }));
        setReviews(reviewsArr);
      } catch {
        setReviews([]);
      }

      // 4) 평균 평점 (실패 시 방금 불러온 후기 평균으로 폴백)
      try {
        const ar = await getCustomerAverageRating(customerId);
        const val = typeof ar?.data === "number" ? ar.data : undefined;
        if (val != null) setAvgRating(val);
      } catch {
        if (reviewsArr.length) {
          const sum = reviewsArr.reduce((a, b) => a + (b.rating || 0), 0);
          setAvgRating((sum / reviewsArr.length) || 0);
        } else {
          setAvgRating(undefined);
        }
      }
    } catch (e) {
      setErr(e?.message || "고객사 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  const ratingText = useMemo(() => {
    if (avgRating == null) return "평점 정보 없음";
    return `⭐ ${avgRating.toFixed(1)}`;
  }, [avgRating]);

  return (
    <>
      <CustomerHeader companyName={company.name} />
      <div className="relative pb-40">
        <div className="p-6 max-w-6xl mx-auto space-y-12">
          {/* 상태 */}
          {loading && <div className="text-center text-gray-500 py-8">불러오는 중...</div>}
          {err && <div className="text-center text-red-600 py-6">{err}</div>}

          {/* 🔷 고객사 프로필 카드 */}
          {!loading && !err && (
            <div className="relative bg-gradient-to-br from-indigo-100 to-white rounded-3xl shadow-xl overflow-hidden">
              <img
                src={company.imageUrl || centerImg}
                alt="Company"
                className="w-full h-160 object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/40 to-transparent p-6 flex flex-col justify-end">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{company.name || "고객사"}</h2>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>주소:</strong> {company.address || "-"}</p>
                  <p><strong>영업시간:</strong> {company.openingHours || "-"}</p>
                  {(company.contactName || company.contactPhone) && (
                    <p><strong>담당자:</strong> {company.contactName} {company.contactPhone && `(${company.contactPhone})`}</p>
                  )}
                  <p><strong>평균 평점:</strong> {ratingText}</p>
                  {!!categories.length && (
                    <p className="flex flex-wrap gap-1 pt-1">
                      {categories.map((t) => (
                        <span key={t} className="px-2 py-0.5 text-[11px] rounded-full bg-white/70 border">{t}</span>
                      ))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 🔶 수리 가능 항목 */}
          {!loading && !err && (
            <div className="bg-white rounded-3xl shadow-md p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold mb-6 border-b pb-2">수리 가능 항목</h3>
              </div>
              {items.length ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {items.map(item => (
                    <li key={item.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50 hover:shadow-md transition">
                      <div className="text-sm text-gray-500 mb-1">{item.category}</div>
                      <div className="font-semibold text-lg text-gray-800">{item.name}</div>
                      <div className="mt-2 text-blue-600 font-bold">₩{(item.price ?? 0).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">등록된 항목이 없습니다.</p>
              )}
            </div>
          )}

          {/* 🟢 후기 목록 */}
          {!loading && !err && (
            <div className="bg-white rounded-3xl shadow-md p-8">
              <h3 className="text-2xl font-semibold mb-6 border-b pb-2">고객 후기</h3>
              {reviews.length ? (
                <ul className="space-y-4">
                  {reviews.map(review => (
                    <li key={review.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-800 font-medium">{review.username}</span>
                        <span className="text-yellow-500 text-sm">{'⭐'.repeat(review.rating || 0)}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{review.content}</p>
                      <p className="text-xs text-gray-400">작성일: {review.createdAt}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">아직 후기가 없습니다.</p>
              )}
            </div>
          )}
        </div>

        {/* 🟡 하단 고정 툴바 */}
        {!loading && !err && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-6 flex justify-between items-center shadow-md z-50">
            <p className="text-sm font-semibold text-gray-800">해당 업체에서 수리를 하고 싶다면?</p>
            <button
              className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700"
              onClick={() => setOpenModal(true)}
            >
              수리신청
            </button>
          </div>
        )}

        {/* ✅ 수리신청 모달 */}
        <RepairRequestModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          customerId={customerId}
          defaultCategoryId={undefined}
          defaultItemId={undefined}
          defaultPhone={""}
        />
      </div>
    </>
  );
}