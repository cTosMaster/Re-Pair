import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getCategories } from "../../services/adminAPI";
import { uploadFile } from "../../services/fileAPI";
import { useResultModal } from "../../hooks/useResultModal";
import {
  Mail,
  Clock,
  Link as LinkIcon,
  Plus,
  X,
  Sparkles,
  UploadCloud,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function CompanyInfoFormStepTwo({ onBack, onSubmit, submitting }) {
  const { Modal, openError, openWarn } = useResultModal();

  const [form, setForm] = useState({
    contactEmail: "",
    openingHours: "",
    businessDocUrl: "",
    termsAgreed: false,
    categoryIds: [],
  });

  // 업로드 상태
  const [docUpload, setDocUpload] = useState({
    uploading: false,
    progress: 0,
    fileName: "",
    error: null,
  });

  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getCategories({
          page: 0,
          size: 1000,
          sortBy: "categoryId",
          sortDir: "asc",
        });
        if (cancelled) return;

        const data = res?.data ?? {};
        const list = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
          ? data
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
          .sort((a, b) =>
            (a.group + a.name).localeCompare(b.group + b.name, "ko")
          );
        setCategories(mapped);
      } catch (err) {
        if (!cancelled) {
          openWarn("카테고리 조회 실패:" + (err?.message || "알 수 없는 오류"));
        }
      } finally {
        if (!cancelled) setLoadingCats(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [openWarn]);

  const grouped = useMemo(() => {
    return categories.reduce((acc, c) => {
      (acc[c.group] = acc[c.group] || []).push(c);
      return acc;
    }, {});
  }, [categories]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleCategory = (id) => {
    setForm((prev) => {
      const has = prev.categoryIds.includes(id);
      return {
        ...prev,
        categoryIds: has
          ? prev.categoryIds.filter((v) => v !== id)
          : [...prev.categoryIds, id],
      };
    });
  };

  const selectAllInGroup = (group) => {
    const ids = (grouped[group] || []).map((c) => c.id);
    setForm((prev) => ({
      ...prev,
      categoryIds: Array.from(new Set([...prev.categoryIds, ...ids])),
    }));
  };

  const clearGroup = (group) => {
    const ids = new Set((grouped[group] || []).map((c) => c.id));
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.filter((id) => !ids.has(id)),
    }));
  };

  const toggleExpand = (group) =>
    setExpanded((prev) => ({ ...prev, [group]: !prev[group] }));

  // ✅ 증빙서류 업로드 → complete로 받은 영구 URL을 자동 채움
  const handleDocPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocUpload({
      uploading: true,
      progress: 0,
      fileName: file.name,
      error: null,
    });

    try {
      const { url } = await uploadFile(file, {
        onProgress: (pct) =>
          setDocUpload((s) => ({
            ...s,
            progress: typeof pct === "number" ? pct : s.progress,
          })),
      });
      setForm((prev) => ({ ...prev, businessDocUrl: url || "" }));
      setDocUpload((s) => ({ ...s, uploading: false, progress: 100 }));
    } catch (err) {
      console.error(err);
      setDocUpload({
        uploading: false,
        progress: 0,
        fileName: "",
        error: "업로드에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      e.target.value = ""; // 같은 파일 재선택 가능하도록 초기화
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (docUpload.uploading) return; // 업로드 중엔 제출 방지

    const payload = {
      contactEmail: form.contactEmail.trim(),
      openingHours: form.openingHours.trim(),
      businessDocUrl: form.businessDocUrl.trim(),
      termsAgreed: !!form.termsAgreed,
      categoryIds: form.categoryIds,
    };

    try {
      const result = await Promise.resolve(onSubmit?.(payload));
      if (result === false || result?.ok === false) {
        throw new Error("submit failed");
      }
    } catch (err) {
      console.error(err);
      openError("업체 등록에 실패했습니다.");
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">회사 정보를 입력해 주세요</h1>
        <span className="text-[#6b8b4e] text-sm">2/2</span>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* 업체 이메일 */}
        <div>
          <label className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span>
              업체 이메일 <span className="text-red-500">*</span>
            </span>
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
            <span>
              영업시간 <span className="text-red-500">*</span>
            </span>
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

        {/* ✅ 증빙 서류 업로드 */}
        <div>
          <label className="flex items-center gap-2 mb-2">
            <LinkIcon className="w-4 h-4 text-gray-500" />
            <span>
              증빙 서류 <span className="text-red-500">*</span>
            </span>
          </label>

          <div
            className="flex items-center gap-2 mb-2"
            style={{ width: "492px" }}
          >
            <input
              type="text"
              name="businessDocUrl"
              value={form.businessDocUrl}
              onChange={onChange}
              placeholder="업로드 완료 시 영구 URL이 자동 입력됩니다"
              className="w-full border border-gray-300 rounded-md px-4 py-2"
              readOnly
            />
          </div>

          <div className="flex flex-col gap-2" style={{ width: "492px" }}>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 cursor-pointer">
              <UploadCloud className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                파일 선택 (PDF, JPG/PNG)
              </span>
              <input
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={handleDocPick}
              />
            </label>

            {docUpload.fileName && !docUpload.uploading && !docUpload.error && (
              <div className="text-xs text-emerald-700 inline-flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{docUpload.fileName} 업로드 완료</span>
              </div>
            )}
            {docUpload.uploading && (
              <div className="text-xs text-gray-600 inline-flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>업로드 중... {Math.round(docUpload.progress)}%</span>
              </div>
            )}
            {docUpload.error && (
              <div className="text-xs text-rose-600">{docUpload.error}</div>
            )}
          </div>

          {docUpload.uploading && (
            <div
              className="mt-2 w-full bg-gray-100 rounded h-2 overflow-hidden"
              style={{ width: "492px" }}
            >
              <div
                className="h-2 bg-[#a3cd7f] transition-all"
                style={{ width: `${Math.round(docUpload.progress)}%` }}
              />
            </div>
          )}

          {form.businessDocUrl && (
            <div className="mt-2">
              <a
                href={form.businessDocUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                영구 URL 열기
              </a>
            </div>
          )}
        </div>

        {/* 플랫폼 카테고리 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#a3cd7f]" />
              <span>
                카테고리 선택 <span className="text-red-500">*</span>
              </span>
            </label>
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
                <section
                  key={group}
                  className="mb-3"
                  aria-label={`${group} 카테고리`}
                >
                  <div className="flex items-center justify-between mb-1">
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
                              : "bg-white border-gray-300 text-gray-700 hover:border-[#a3cd7f]",
                          ].join(" ")}
                          title={c.name}
                        >
                          <span className="truncate">{c.name}</span>
                          {selected ? (
                            <span
                              className="inline-block w-2 h-2 rounded-full bg-white/90"
                              aria-hidden="true"
                            />
                          ) : (
                            <span
                              className="inline-block w-2 h-2 rounded-full bg-gray-300"
                              aria-hidden="true"
                            />
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
                  <div className="text-xs text-gray-500">
                    선택됨:{" "}
                    <span className="font-medium">{form.categoryIds.length}</span>
                    개
                  </div>
                </section>
              );
            })
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

        {/* 버튼 영역 */}
        <div
          className="flex flex-col gap-3 items-center"
          style={{ width: "492px" }}
        >
          <button
            type="submit"
            disabled={submitting || docUpload.uploading}
            className="w-full bg-[#a3cd7f] text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-60 hover:bg-[#8ab96d]"
            style={{ height: "48px" }}
          >
            {submitting
              ? "등록 중..."
              : docUpload.uploading
              ? "증빙서류 업로드 중..."
              : "등록하기"}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-[#6b8b4e] hover:text-[#4a5f36] font-medium py-2 rounded-lg transition-colors text-center"
            style={{ height: "48px" }}
          >
            ← 이전 단계로
          </button>
        </div>
      </form>
    </div>
  );
}

CompanyInfoFormStepTwo.propTypes = {
  onBack: PropTypes.func.isRequired,
  onSubmit: PropTypes.func,
  submitting: PropTypes.bool,
};