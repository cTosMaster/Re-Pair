import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// 공용 컴포넌트
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import FirstEstimateForm from "../../components/repairdetail/waitingforrepair/FirstEstimateForm";
import SelectedEngineerCard from "../../components/repairdetail/common/SelectedEngineerCard";
import FirstEstimatePreview from "../../components/repairdetail/waitingforrepair/FirstEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";

// 서비스(API)
import { getRequestHistory, getEngineer } from "../../services/commonAPI";
import { getRepairRequest, listPresets, getFirstEstimate } from "../../services/customerAPI";

// 상태 맵
import { RepairStatusMap } from "../../constants/repairStatus";

// ✅ 상태→UI/라우트 공용 유틸
import { fromApiToUi, segmentForStatus } from "../../routes/statusRoute";

/** 카드 맵핑 (간결 버전) */
const toEngineerCard = (eng, detail = {}) =>
  !eng
    ? null
    : {
        name: eng.name ?? eng.username ?? eng.email ?? "배정된 기사",
        email: eng.email ?? "",
        phone: eng.phone ?? "",
        profileImage: eng.imageUrl ?? "",
        dateText:
          eng.registeredAt ??
          detail.assignedAt ??
          detail.updatedAt ??
          detail.createdAt ??
          "",
      };

/** 상태 이력 → 현재 상태/취소 여부 도출 */
const deriveStatusFromHistory = (history = []) => {
  if (!Array.isArray(history) || history.length === 0) {
    return { statusCode: "WAITING_FOR_REPAIR", isCancelled: false, cancelReason: null };
  }
  const norm = history.map((h) => ({
    ...h,
    previousStatus: fromApiToUi(h?.previousStatus),
    newStatus: fromApiToUi(h?.newStatus),
  }));
  const last = norm[norm.length - 1];
  const statusCode = last?.newStatus ?? "WAITING_FOR_REPAIR";
  const canceledItem = [...norm].reverse().find((h) => h?.newStatus === "CANCELLED");
  return {
    statusCode,
    isCancelled: statusCode === "CANCELLED",
    cancelReason: canceledItem?.memo ?? null,
  };
};

const DUMMY_ENGINEER = {
  name: "김독수리",
  email: "engineer01@example.com",
  phone: "010-0000-0000",
  profileImage: "",
  dateText: "",
};

export default function WaitingForRepairPage() {
  const { requestId: _rid } = useParams();
  const requestId = _rid ?? "";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // ✅ engineerid 기준 (state 우선, 없으면 ?eid)
  const inboundEngineerId = useMemo(() => {
    const s = location.state?.engineerid ?? location.state?.engineerId ?? null;
    const qs = new URLSearchParams(location.search);
    const v = s ?? qs.get("eid") ?? qs.get("engineerid");
    return v != null && String(v).trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
  }, [location.state, location.search]);

  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState("WAITING_FOR_REPAIR");
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelReason, setCancelReason] = useState(null);

  const [engineerCard, setEngineerCard] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [presetList, setPresetList] = useState([]);

  // 요청 상세에서 categoryId/itemId 추출 → 폼에 내려줌
  const [itemId, setItemId] = useState(null);

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

        // 1) 상태 이력
        const history = await getRequestHistory(requestId, { signal: ac.signal });
        const d = deriveStatusFromHistory(history);
        setStatusCode(d.statusCode);
        setIsCancelled(d.isCancelled);
        setCancelReason(d.cancelReason);

        // 2) 상태 기반 경로 교정 (+ engineerid 보존)
        const isPeek = location.state?.peek === true || new URLSearchParams(location.search).has("peek");
        if (!isPeek) {
          const expectedSeg = segmentForStatus(d.statusCode);
          const endsWithExpected = location.pathname.endsWith(`/${expectedSeg}`);
          if (!endsWithExpected) {
            const qs = new URLSearchParams(location.search);
            if (inboundEngineerId != null && !qs.get("eid") && !qs.get("engineerid")) {
              qs.set("eid", String(inboundEngineerId));
            }
            navigate(
              `/repair-requests/${encodeURIComponent(requestId)}/${expectedSeg}${qs.toString() ? `?${qs}` : ""}`,
              { replace: true, state: { ...location.state, engineerid: inboundEngineerId } }
            );
            return;
          }
        }

        // 3) 요청 상세 → 엔지니어 카드 + categoryId/itemId 추출
        const { data: detail } = await getRepairRequest(requestId, { signal: ac.signal });
        const fallbackEng = detail?.engineer ?? detail?.assignedEngineer ?? detail?.engineerInfo ?? null;

        const catId = detail?.category?.id ?? detail?.categoryId ?? detail?.request?.category?.id ?? null;
        const itId  = detail?.item?.id     ?? detail?.itemId     ?? detail?.request?.item?.id     ?? null;
        setItemId(itId ?? null);

        const detailEngineerId = detail?.engineerid ?? detail?.engineerId ?? null;
        const engineerId = inboundEngineerId ?? detailEngineerId ?? null;

        if (engineerId) {
          try {
            const { data: eng } = await getEngineer(engineerId, { signal: ac.signal });
            setEngineerCard(toEngineerCard(eng, detail));
          } catch {
            setEngineerCard(toEngineerCard(fallbackEng, detail));
          }
        } else {
          setEngineerCard(toEngineerCard(fallbackEng, detail));
        }

        // 4) 1차 견적 (프리뷰)  — customerAPI로 조회
        try {
          const { data: fe } = await getFirstEstimate(requestId, { signal: ac.signal });
          const presets = Array.isArray(fe?.presets)
            ? fe.presets.map((p) => ({
                id: p.id ?? p.presetId ?? p.code ?? Math.random(),
                name: p.name ?? p.title ?? "프리셋",
                price: p.price ?? p.amount ?? 0,
              }))
            : [];
          setEstimate({
            presets,
            extraNote: fe?.description ?? fe?.extraNote ?? "",
            totalPrice:
              (typeof fe?.totalPrice === "number" ? fe.totalPrice : undefined) ??
              (presets.reduce((s, p) => s + (p.price || 0), 0) + (Number(fe?.extraAmount) || 0)),
            createdAt: fe?.createdAt ?? "",
          });
        } catch {
          setEstimate(null);
        }

        // 5) 프리셋 목록 (서버 필터: categoryId + itemId)
        if (!d.isCancelled && d.statusCode === "WAITING_FOR_REPAIR" && (isEngineer || isAdmin || isCustomer)) {
          const { data: presetRes } = await listPresets(
            {
              page: 0,
              size: 50,
              categoryId: catId ?? undefined,
              itemId: itId ?? undefined,
            },
            { signal: ac.signal }
          );

          const items = Array.isArray(presetRes?.content)
            ? presetRes.content
            : Array.isArray(presetRes?.items)
            ? presetRes.items
            : Array.isArray(presetRes)
            ? presetRes
            : [];

          setPresetList(
            items.map((p) => ({
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [requestId, location.pathname, navigate, inboundEngineerId, isEngineer, isAdmin, isCustomer]);

  // 등록 후 프리뷰 다시 불러오기
  const reloadFirstEstimate = async () => {
    try {
      const { data: fe } = await getFirstEstimate(requestId);
      const presets = Array.isArray(fe?.presets)
        ? fe.presets.map((p) => ({
            id: p.id ?? p.presetId ?? p.code ?? Math.random(),
            name: p.name ?? p.title ?? "프리셋",
            price: p.price ?? p.amount ?? 0,
          }))
        : [];
      setEstimate({
        presets,
        extraNote: fe?.description ?? fe?.extraNote ?? "",
        totalPrice:
          (typeof fe?.totalPrice === "number" ? fe.totalPrice : undefined) ??
          (presets.reduce((s, p) => s + (p.price || 0), 0) + (Number(fe?.extraAmount) || 0)),
        createdAt: fe?.createdAt ?? "",
      });
    } catch {
      setEstimate(null);
    }
  };

  const currentStep = RepairStatusMap["WAITING_FOR_REPAIR"];
  const userStep = RepairStatusMap[statusCode] ?? 0;
  const isPastStep = !isCancelled && userStep > currentStep;

  if (authLoading || loading) return <div className="p-6 text-center text-gray-500">로딩 중...</div>;
  if (!isAuthenticated || role === "GUEST")
    return <div className="p-6 text-center text-gray-500">이 페이지는 로그인 후 이용할 수 있습니다.</div>;
  if (!requestId) return <div className="p-6 text-center text-red-500">잘못된 접근입니다. (요청 ID 없음)</div>;

  return (
    <div className="p-6 space-y-6">
      {isPastStep ? (
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
          {estimate && <FirstEstimatePreview estimate={estimate} />}
        </div>
      ) : isCancelled ? (
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={true} requestId={requestId} />
          {estimate && <FirstEstimatePreview estimate={estimate} />}
          <RejectReasonBox reason={cancelReason} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                현재 고객님의 물품에 대한 1차 견적을 작성중입니다.
                <br />
                추가로 수리기사와 유선 상담이 있을 예정입니다.
              </div>
            </div>
          )}

          {(isCustomer || isEngineer || isAdmin) && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
              {/* ✅ 조회된 견적이 있으면 미리보기, 없으면 등록 폼 노출 */}
              {estimate ? (
                <FirstEstimatePreview estimate={estimate} />
              ) : (
                <FirstEstimateForm
                  requestId={Number(requestId)}
                  presetList={presetList}
                  itemId={itemId ?? undefined}
                  onCreated={reloadFirstEstimate}
                />
              )}
            </div>
          )}
        </>
      )}

      <SelectedEngineerCard engineer={engineerCard ?? DUMMY_ENGINEER} />
    </div>
  );
}