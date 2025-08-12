import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getCategories } from "../../services/adminAPI";
import {
  Mail, Clock, Link as LinkIcon, // 라벨용
  Plus, X,                       // 칩/태그용
  Sparkles, Layers,               // 섹션 타이틀/기본 아이콘
} from "lucide-react";

export default function CompanyInfoFormStepTwo({ onBack, onSubmit, submitting }) {
  const [form, setForm] = useState({
    contactEmail: "",
    openingHours: "",
    businessDocUrl: "",
    termsAgreed: false,
    categoryIds: [], // 서버로 보낼 ID 배열
  });

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [expanded, setExpanded] = useState({}); // 그룹별 더보기 상태

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // 새 API(Page<PlatformCategoryDto>) 대응
        // adminAPI.getCategories는 내가 앞서 만든 래퍼(페이지 size 크게)라고 가정
        const res = await getCategories({ page: 0, size: 1000, sortBy: "categoryId", sortDir: "asc" });
        if (!mounted) return;
        const data = res?.data ?? {};
        const list = Array.isArray(data?.content) ? data.content
          : Array.isArray(data) ? data
            : [];
        const mapped = list
          .map((c) => {
            const id = Number(c.categoryId ?? c.id);
            const name = c.name ?? c.label ?? String(id);
            const group =
              c.groupName ??
              c.parentName ??
              c.parentCategoryName ??
              c.parent ??
              "전체 카테고리";
            return { id, name, group };
          })
          .filter((c) => c.id != null)
          .sort((a, b) => (a.group + a.name).localeCompare(b.group + b.name, "ko"));
        setCategories(mapped);
      } catch (e) {
        console.warn("카테고리 조회 실패:", e?.response?.status, e?.message);
      } finally {
        if (mounted) setLoadingCats(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // 그룹핑
  const grouped = useMemo(() => {
    return categories.reduce((acc, c) => {
      (acc[c.group] = acc[c.group] || []).push(c);
      return acc;
    }, {});
  }, [categories]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleCategory = (id) => {
    setForm((prev) => {
      const has = prev.categoryIds.includes(id);
      return { ...prev, categoryIds: has ? prev.categoryIds.filter((v) => v !== id) : [...prev.categoryIds, id] };
    });
  };

  const selectAllInGroup = (group) => {
    const ids = (grouped[group] || []).map((c) => c.id);
    setForm((prev) => ({ ...prev, categoryIds: Array.from(new Set([...prev.categoryIds, ...ids])) }));
  };

  const clearGroup = (group) => {
    const ids = new Set((grouped[group] || []).map((c) => c.id));
    setForm((prev) => ({ ...prev, categoryIds: prev.categoryIds.filter((id) => !ids.has(id)) }));
  };

  const toggleExpand = (group) => setExpanded((prev) => ({ ...prev, [group]: !prev[group] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      contactEmail: form.contactEmail.trim(),
      openingHours: form.openingHours.trim(),
      businessDocUrl: form.businessDocUrl.trim(),
      termsAgreed: !!form.termsAgreed,
      categoryIds: form.categoryIds,
    });
  };

  return (
    <div className="mt-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">회사 정보를 입력해 주세요</h1>
        <span className="text-[#6b8b4e] text-sm">2/2</span>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* 업체 이메일 */}
        <div>
          <label className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span>업체 이메일 <span className="text-red-500">*</span></span>
          </label>
          <input
            type="email"
            name="contactEmail"
            value={form.contactEmail}
            onChange={onChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{ width: "492px", height: "48px" }}
          />
        </div>

        {/* 영업시간 */}
        <div>
          <label className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>영업시간 <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            name="openingHours"
            value={form.openingHours}
            onChange={onChange}
            placeholder="예: 평일 09:00~18:00"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{ width: "492px", height: "48px" }}
          />
        </div>

        {/* 증빙 서류 URL */}
        <div>
          <label className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-4 h-4 text-gray-500" />
            <span>증빙 서류 URL <span className="text-red-500">*</span></span>
          </label>
          <input
            type="url"
            name="businessDocUrl"
            value={form.businessDocUrl}
            onChange={onChange}
            placeholder="https://... (사업자등록증 등)"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{ width: "492px", height: "48px" }}
          />
        </div>

        {/* 플랫폼 카테고리 (칩 + 그룹형, 아이콘 리치) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#a3cd7f]" />
              <span>카테고리 선택 <span className="text-red-500">*</span></span>
            </label>
            <div className="text-xs text-gray-500">
              선택됨: <span className="font-medium">{form.categoryIds.length}</span>개
            </div>
          </div>

          {loadingCats ? (
            <div
              className="border border-gray-200 rounded-lg p-4 text-sm text-gray-500 bg-white"
              style={{ width: "492px" }}
            >
              카테고리를 불러오는 중...
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div
              className="border border-gray-200 rounded-lg p-4 text-sm text-gray-500 bg-white"
              style={{ width: "492px" }}
            >
              등록된 카테고리가 없습니다.
            </div>
          ) : (
            Object.keys(grouped).map((group) => {
              const items = grouped[group] || [];
              const isExpanded = !!expanded[group];
              const visible = isExpanded ? items : items.slice(0, 12);
              const hiddenCount = Math.max(0, items.length - visible.length);

              return (
                <section key={group} className="mb-3" aria-label={`${group} 카테고리`}>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Layers className="w-4 h-4 text-gray-500" />
                      {group}
                    </h4>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => selectAllInGroup(group)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                        title={`${group} 전체 선택`}
                      >
                        <Plus className="w-3 h-3" /> 전체선택
                      </button>
                      <button
                        type="button"
                        onClick={() => clearGroup(group)}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                        title={`${group} 선택 해제`}
                      >
                        <X className="w-3 h-3" /> 해제
                      </button>
                    </div>
                  </div>

                  {/* 옵션 그리드 (아이콘 없는 버전) */}
                  <div
                    role="listbox"
                    aria-multiselectable="true"
                    className="grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-2 bg-white"
                    style={{ width: "492px" }}
                  >
                    {visible.map((c) => {
                      const selected = form.categoryIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => toggleCategory(c.id)}
                          className={[
                            "flex items-center justify-between w-full rounded-full border px-4 py-2 text-sm transition",
                            selected
                              ? "bg-[#a3cd7f] border-[#a3cd7f] text-white shadow-sm"
                              : "bg-white border-gray-300 text-gray-700 hover:border-[#a3cd7f]"
                          ].join(" ")}
                          title={c.name}
                        >
                          <span className="truncate">{c.name}</span>
                          {selected ? (
                            <span className="inline-block w-2 h-2 rounded-full bg-white/90" aria-hidden="true" />
                          ) : (
                            <span className="inline-block w-2 h-2 rounded-full bg-gray-300" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}

                    {hiddenCount > 0 && !isExpanded && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(group)}
                        className="col-span-2 text-xs px-3 py-2 border border-dashed border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        나머지 {hiddenCount}개 더 보기
                      </button>
                    )}
                    {isExpanded && items.length > 12 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(group)}
                        className="col-span-2 text-xs px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        접기
                      </button>
                    )}
                  </div>
                </section>
              );
            })
          )}

          {/* 선택된 카테고리 프리뷰 */}
          {form.categoryIds.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2" style={{ width: "492px" }}>
              {form.categoryIds
                .map((id) => categories.find((c) => c.id === id))
                .filter(Boolean)
                .map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-2 text-xs rounded-full border px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    {c.name}
                    <button
                      type="button"
                      onClick={() => toggleCategory(c.id)}
                      className="-mr-1 px-1 leading-none hover:text-emerald-900"
                      aria-label={`${c.name} 제거`}
                      title="제거"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* 약관 동의 */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="termsAgreed"
            checked={form.termsAgreed}
            onChange={onChange}
          />
          <span>약관에 동의합니다.</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#a3cd7f] text-white font-bold py-2 rounded mt-2 rounded-lg disabled:opacity-60 "
          style={{ width: "492px", height: "48px" }}
        >
          {submitting ? "등록 중..." : "등록하기"}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full text-[#6b8b4e] font-medium py-2 rounded mt-2 pr-23"
        >
          ← 이전 단계로
        </button>
      </form>
    </div>
  );
}

CompanyInfoFormStepTwo.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
};