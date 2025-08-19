import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// 공용 컴포넌트
import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import SelectedEngineerCard from "../../components/repairdetail/common/SelectedEngineerCard";
import FinalEstimateForm from "../../components/repairdetail/inprogress/FinalEstimateForm";
import FinalEstimatePreview from "../../components/repairdetail/common/FinalEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";

// 서비스(API)
import { getRequestHistory } from "../../services/commonAPI";
import {
  getRepairRequest,
  getFirstEstimate,
  listPresets, // ✅ 대기페이지와 동일한 customerAPI.listPresets 사용
} from "../../services/customerAPI";
import {
  getFinalEstimate as getFinalEstimateByRepair, // 최종견적(수리건ID 기준)
} from "../../services/engineerAPI";

// ✅ 상태→코드/라우트 공용 유틸
import { fromApiToUi, segmentForStatus } from "../../routes/statusRoute";

/** 이력에서 현재 상태/취소 여부/취소사유 도출 (statusRoute 유틸만 사용) */
const deriveStatusFromHistory = (history = []) => {
  if (!Array.isArray(history) || history.length === 0) {
    return { statusCode: "IN_PROGRESS", isCancelled: false, cancelReason: null };
  }
  const norm = history.map((h) => ({
    ...h,
    previousStatus: fromApiToUi(h?.previousStatus),
    newStatus: fromApiToUi(h?.newStatus),
  }));
  const last = norm[norm.length - 1];
  const statusCode = last?.newStatus ?? "IN_PROGRESS";
  const canceledItem = [...norm].reverse().find((h) => h?.newStatus === "CANCELLED");
  return {
    statusCode,
    isCancelled: statusCode === "CANCELLED",
    cancelReason: canceledItem?.memo ?? null,
  };
};

/** 1차 견적 → FinalEstimateForm 프리필 매핑 */
const mapFirstEstimateToForm = (fe) => {
  if (!fe) return { presets: [], extraNote: "" };
  const extraNote = fe?.description ?? fe?.memo ?? fe?.extraNote ?? "";

  // 응답 내 배열 후보 통합 (케이스 방어)
  const raw =
    Array.isArray(fe?.presets) ? fe.presets :
      Array.isArray(fe?.presetUsages) ? fe.presetUsages :
        Array.isArray(fe?.items) ? fe.items : [];

  // 수량 기반 누적(중복 선택 허용 UX)
  const presets = [];
  raw.forEach((r) => {
    const id = r.id ?? r.presetId ?? r.code ?? Math.random();
    const name = r.name ?? r.title ?? r.presetName ?? "프리셋";
    const unit = r.price ?? r.amount ?? r.unitPrice ?? 0;
    const qty = r.quantity ?? 1;
    for (let i = 0; i < qty; i++) {
      presets.push({ id, name, price: unit });
    }
  });

  return { presets, extraNote };
};

/** 다양한 포맷의 목록 응답을 안전하게 배열로 변환 */
const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.content)) return res.content; // Spring Page
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.records)) return res.records;
  return [];
};

export default function InProgressPage() {
  const { requestId: _rid } = useParams();
  const requestId = _rid ?? "";
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // 화면 상태
  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState("IN_PROGRESS");
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelReason, setCancelReason] = useState(null);

  // 상세/엔지니어/견적/프리셋
  const [engineerCard, setEngineerCard] = useState(null);
  const [finalEstimate, setFinalEstimate] = useState(null); // FinalEstimatePreview용
  const [preEstimate, setPreEstimate] = useState(null);     // FinalEstimateForm 프리필용
  const [presetList, setPresetList] = useState([]);         // FinalEstimateForm 드롭다운용

  // 역할
  const role = useMemo(() => String(user?.role || "GUEST").toUpperCase(), [user]);
  const isUser = role === "USER";
  const isCustomer = role === "CUSTOMER";
  const isEngineer = role === "ENGINEER";
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);
        if (!requestId) return;

        // 1) 상태 이력 → 현재 상태 파악
        const history = await getRequestHistory(requestId, { signal: ac.signal });
        const d = deriveStatusFromHistory(history);
        setStatusCode(d.statusCode);
        setIsCancelled(d.isCancelled);
        setCancelReason(d.cancelReason);

        // ✅ URL 자동 교정: 실제 상태와 URL 세그먼트가 다르면 교체
        const expectedSeg = segmentForStatus(d.statusCode);
        const endsWithExpected = location.pathname.endsWith(`/${expectedSeg}`);
        if (!endsWithExpected) {
          navigate(`/repair-requests/${encodeURIComponent(requestId)}/${expectedSeg}`, { replace: true });
          return; // 경로 교정 시 페이지가 다시 로드됨
        }

        // 2) 요청 상세(엔지니어 카드 구성 + 아이템/카테고리/수리건ID 추출)
        const { data: detail } = await getRepairRequest(requestId, { signal: ac.signal });

        const eng =
          detail?.engineer ??
          detail?.assignedEngineer ??
          detail?.engineerInfo ??
          null;

        if (eng) {
          setEngineerCard({
            name: eng?.name ?? eng?.username ?? eng?.email ?? "배정된 기사",
            email: eng?.email ?? "",
            phone: eng?.phone ?? "",
            profileImage: eng?.imageUrl ?? "",
            dateText: detail?.assignedAt ?? detail?.updatedAt ?? detail?.createdAt ?? "",
          });
        } else {
          setEngineerCard(null);
        }

        const repairId =
          detail?.repairId ??
          detail?.id ??              // 혹시 detail 자체가 repair일 때
          undefined;

        // ✅ 대기페이지와 동일한 방식으로 튼튼하게 추출
        const catId = detail?.category?.id ?? detail?.categoryId ?? detail?.request?.category?.id ?? null;
        const itId = detail?.item?.id ?? detail?.itemId ?? detail?.request?.item?.id ?? null;

        // 3) 최종 견적(있는 경우만) — 수리건 ID 기준
        try {
          const rid = repairId ?? requestId; // 백엔드 구조에 따라 보완
          const { data: fe } = await getFinalEstimateByRepair(rid, { signal: ac.signal });
          const presets = Array.isArray(fe?.presets)
            ? fe.presets.map((p) => ({
              id: p.id ?? p.presetId ?? p.code ?? Math.random(),
              name: p.name ?? p.title ?? "항목",
              price: p.price ?? p.amount ?? 0,
            }))
            : [];
          setFinalEstimate({
            presets,
            extraNote: fe?.description ?? fe?.extraNote ?? "",
            totalPrice:
              (presets || []).reduce((s, p) => s + (p.price || 0), 0) +
              (Number(fe?.extraAmount) || 0),
            beforeImages: fe?.beforeImages ?? fe?.beforeImgs ?? [],
            afterImages: fe?.afterImages ?? fe?.afterImgs ?? [],
            createdAt: fe?.createdAt ?? "",
          });
        } catch {
          setFinalEstimate(null);
        }

        // 4) 1차 견적 → 폼 프리필
        try {
          const { data: fe1 } = await getFirstEstimate(requestId, { signal: ac.signal });
          setPreEstimate(mapFirstEstimateToForm(fe1));
        } catch {
          setPreEstimate(null);
        }

        // 5) 프리셋 목록(아이템/카테고리 기준 필터) — 대기페이지와 동일 스타일 + 클라 재필터
        if (!d.isCancelled && d.statusCode === "IN_PROGRESS" && (isEngineer || isAdmin || isCustomer)) {
          const { data: presetRes } = await listPresets(
            {
              page: 0,
              size: 50,
              categoryId: catId ?? undefined,
              itemId: itId ?? undefined,
            },
            { signal: ac.signal }
          );

          const items = toArray(presetRes);

          // 서버가 전부 다 줄 경우에도 itemId 스코프 강제
          const scoped = itId
            ? items.filter((p) => {
              const pid = p.itemId ?? p.item?.id ?? null;
              return pid != null && String(pid) === String(itId);
            })
            : items;

          setPresetList(
            scoped.map((p) => ({
              id: p.id ?? p.presetId ?? p.code ?? Math.random(),
              name: p.name ?? p.title ?? "프리셋",
              price: p.price ?? p.amount ?? 0,
              itemId: p.itemId ?? p.item?.id ?? null,
              categoryId: p.categoryId ?? p.category?.id ?? null,
            }))
          );
        } else {
          setPresetList([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [requestId, location.pathname, navigate, isEngineer, isAdmin, isCustomer]);

  // 스텝 비교
  const currentStep = RepairStatusMap["IN_PROGRESS"];
  const userStep = RepairStatusMap[statusCode] ?? 0;
  const isPastStep = !isCancelled && userStep > currentStep;

  // 가드
  if (authLoading || loading) {
    return <div className="p-6 text-center text-gray-500">로딩 중...</div>;
  }
  if (!isAuthenticated || role === "GUEST") {
    return <div className="p-6 text-center text-gray-500">이 페이지는 로그인 후 이용할 수 있습니다.</div>;
  }
  if (!requestId) {
    return <div className="p-6 text-center text-red-500">잘못된 접근입니다. (요청 ID 없음)</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {isPastStep ? (
        <div className="text-gray-600 space-y-6">
          <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
          {finalEstimate && <FinalEstimatePreview estimate={finalEstimate} />}
        </div>
      ) : isCancelled ? (
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={true} requestId={requestId} />
          {finalEstimate && <FinalEstimatePreview estimate={finalEstimate} />}
          <RejectReasonBox reason={cancelReason} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
              <div className="flex items-center justify-center text-gray-600 text-sm text-center py-6">
                현재 고객님의 물품에 대한 수리를 진행중입니다.
              </div>
              {engineerCard && <SelectedEngineerCard engineer={engineerCard} />}
              {finalEstimate && <FinalEstimatePreview estimate={finalEstimate} />}
            </div>
          )}

          {(isCustomer || isEngineer || isAdmin) && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
              <FinalEstimateForm
                requestId={Number(requestId) || requestId}   // ✅ 필수
                initialEstimate={preEstimate ?? { presets: [], extraNote: "" }}
                presetList={presetList}
                onSubmitted={() => {
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}