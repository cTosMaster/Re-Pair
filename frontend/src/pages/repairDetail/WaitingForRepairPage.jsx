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
import { getRepairRequest } from "../../services/customerAPI";
import { getPreEstimate, listPresets } from "../../services/engineerAPI";

// 상태 맵
import { RepairStatusMap } from "../../constants/repairStatus";

// ✅ 상태→UI/라우트 공용 유틸
import { fromApiToUi, segmentForStatus } from "../../routes/statusRoute";

/** 카드 맵핑 (간결 버전) */
const toEngineerCard = (eng, detail = {}) => (
  !eng ? null : {
    name: eng.name ?? eng.username ?? eng.email ?? "배정된 기사",
    email: eng.email ?? "",
    phone: eng.phone ?? "",
    profileImage: eng.imageUrl ?? "",
    dateText: eng.registeredAt ?? detail.assignedAt ?? detail.updatedAt ?? detail.createdAt ?? "",
  }
);

/** 상태 이력 → 현재 상태/취소 여부 도출 */
const deriveStatusFromHistory = (history = []) => {
  if (!Array.isArray(history) || history.length === 0) {
    return { statusCode: "WAITING_FOR_REPAIR", isCancelled: false, cancelReason: null };
  }
  const norm = history.map(h => ({
    ...h,
    previousStatus: fromApiToUi(h?.previousStatus),
    newStatus: fromApiToUi(h?.newStatus),
  }));
  const last = norm[norm.length - 1];
  const statusCode = last?.newStatus ?? "WAITING_FOR_REPAIR";
  const canceledItem = [...norm].reverse().find(h => h?.newStatus === "CANCELLED");
  return { statusCode, isCancelled: statusCode === "CANCELLED", cancelReason: canceledItem?.memo ?? null };
};

const DUMMY_ENGINEER = { name: "김독수리", email: "engineer01@example.com", phone: "010-0000-0000", profileImage: "", dateText: "" };

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

        // 3) 요청 상세 → 엔지니어 카드
        const { data: detail } = await getRepairRequest(requestId, { signal: ac.signal });
        const fallbackEng = detail?.engineer ?? detail?.assignedEngineer ?? detail?.engineerInfo ?? null;

        const detailEngineerId = detail?.engineerid ?? null; // 👈 서버 응답 키: engineerid
        const engineerId = inboundEngineerId ?? detailEngineerId ?? null;

        if (engineerId) {
          try {
            console.log("[WFR] calling getEngineer with", engineerId);
            const { data: eng } = await getEngineer(engineerId, { signal: ac.signal });
            setEngineerCard(toEngineerCard(eng, detail));
          } catch {
            setEngineerCard(toEngineerCard(fallbackEng, detail));
          }
        } else {
          setEngineerCard(toEngineerCard(fallbackEng, detail));
        }

        // 4) 1차 견적
        try {
          const { data: pe } = await getPreEstimate(requestId, { signal: ac.signal });
          const presets = Array.isArray(pe?.presets)
            ? pe.presets.map(p => ({ id: p.id ?? p.presetId ?? p.code ?? Math.random(), name: p.name ?? p.title ?? "프리셋", price: p.price ?? p.amount ?? 0 }))
            : [];
          setEstimate({
            presets,
            extraNote: pe?.description ?? pe?.extraNote ?? "",
            totalPrice: presets.reduce((s, p) => s + (p.price || 0), 0) + (Number(pe?.extraAmount) || 0),
            createdAt: pe?.createdAt ?? "",
          });
        } catch {
          setEstimate(null);
        }

        // 5) 프리셋 목록
        if (!d.isCancelled && d.statusCode === "WAITING_FOR_REPAIR" && (isEngineer || isAdmin || isCustomer)) {
          const { data: presetRes } = await listPresets({ page: 0, size: 50, signal: ac.signal });
          const items = Array.isArray(presetRes?.items) ? presetRes.items : (Array.isArray(presetRes) ? presetRes : []);
          setPresetList(items.map(p => ({ id: p.id ?? p.presetId ?? p.code ?? Math.random(), name: p.name ?? p.title ?? "프리셋", price: p.price ?? p.amount ?? 0 })));
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
  }, [requestId, location.pathname, navigate, isEngineer, isAdmin, isCustomer, inboundEngineerId]);

  const currentStep = RepairStatusMap["WAITING_FOR_REPAIR"];
  const userStep = RepairStatusMap[statusCode] ?? 0;
  const isPastStep = !isCancelled && userStep > currentStep;

  if (authLoading || loading) return <div className="p-6 text-center text-gray-500">로딩 중...</div>;
  if (!isAuthenticated || role === "GUEST") return <div className="p-6 text-center text-gray-500">이 페이지는 로그인 후 이용할 수 있습니다.</div>;
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
              <FirstEstimateForm presetList={presetList} initialEngineerId={inboundEngineerId} />
            </div>
          )}
        </>
      )}

      <SelectedEngineerCard engineer={engineerCard ?? DUMMY_ENGINEER} />
    </div>
  );
}