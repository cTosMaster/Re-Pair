import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { segmentForStatus } from "../../routes/statusRoute";

// 공용 컴포넌트
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import FirstEstimateForm from "../../components/repairdetail/waitingforrepair/FirstEstimateForm";
import SelectedEngineerCard from "../../components/repairdetail/common/SelectedEngineerCard";
import FirstEstimatePreview from "../../components/repairdetail/waitingforrepair/FirstEstimatePreview";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";

// 서비스(API)
import { getRequestHistory } from "../../services/commonAPI";
import { getRepairRequest } from "../../services/customerAPI";
import { getPreEstimate, listPresets } from "../../services/engineerAPI";

// 상태 맵
import { RepairStatusMap } from "../../constants/repairStatus";

/** 백엔드 상태 → UI 상태 변환(CANCELED → CANCELLED 등 표기 보정) */
const toUiStatus = (s) =>
  ({
    PENDING: "PENDING_APPROVAL",
    CANCELED: "CANCELLED",
    WAITING_FOR_REPAIR: "WAITING_FOR_REPAIR",
    IN_PROGRESS: "IN_PROGRESS",
    WAITING_FOR_PAYMENT: "WAITING_FOR_PAYMENT",
    WAITING_FOR_DELIVERY: "WAITING_FOR_DELIVERY",
    COMPLETED: "COMPLETED",
  }[s] ?? s);

/** 이력에서 현재 상태/취소 여부/취소사유 도출 */
const deriveStatusFromHistory = (history = []) => {
  if (!Array.isArray(history) || history.length === 0) {
    return { statusCode: "WAITING_FOR_REPAIR", isCancelled: false, cancelReason: null };
  }
  const norm = history.map((h) => ({
    ...h,
    previousStatus: toUiStatus(h?.previousStatus),
    newStatus: toUiStatus(h?.newStatus),
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

// ✅ 더미 엔지니어 카드 (실데이터 없을 때 사용)
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

  // 화면 상태
  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState("WAITING_FOR_REPAIR");
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelReason, setCancelReason] = useState(null);

  // 엔지니어 카드 / 견적서 / 프리셋
  const [engineerCard, setEngineerCard] = useState(null);
  const [estimate, setEstimate] = useState(null);   // FirstEstimatePreview용
  const [presetList, setPresetList] = useState([]); // FirstEstimateForm용

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

        // 1) 상태 이력
        const history = await getRequestHistory(requestId, { signal: ac.signal });
        const d = deriveStatusFromHistory(history);
        setStatusCode(d.statusCode);
        setIsCancelled(d.isCancelled);
        setCancelReason(d.cancelReason);

        // ✅ 상태에 맞는 경로로 자동 교정
        const expectedSeg = segmentForStatus(d.statusCode);
        const endsWithExpected = location.pathname.endsWith(`/${expectedSeg}`);
        if (!endsWithExpected) {
          navigate(`/repair-requests/${encodeURIComponent(requestId)}/${expectedSeg}`, { replace: true });
          return; // 경로 교정 후 이 컴포넌트가 다시 로드됨
        }

        // 2) 요청 상세 (엔지니어 카드 구성)
        const { data: detail } = await getRepairRequest(requestId, { signal: ac.signal });
        const eng =
          detail?.engineer ??
          detail?.assignedEngineer ??
          detail?.engineerInfo ??
          null;

        setEngineerCard(
          eng
            ? {
                name: eng?.name ?? eng?.username ?? eng?.email ?? "배정된 기사",
                email: eng?.email ?? "",
                phone: eng?.phone ?? "",
                profileImage: eng?.imageUrl ?? "",
                dateText: detail?.assignedAt ?? detail?.updatedAt ?? detail?.createdAt ?? "",
              }
            : null
        );

        // 3) 1차 견적(있는 경우만)
        try {
          const { data: pe } = await getPreEstimate(requestId, { signal: ac.signal });
          const presets = Array.isArray(pe?.presets)
            ? pe.presets.map((p) => ({
                id: p.id ?? p.presetId ?? p.code ?? Math.random(),
                name: p.name ?? p.title ?? "프리셋",
                price: p.price ?? p.amount ?? 0,
              }))
            : [];

          setEstimate({
            presets,
            extraNote: pe?.description ?? pe?.extraNote ?? "",
            totalPrice:
              (presets || []).reduce((s, p) => s + (p.price || 0), 0) +
              (Number(pe?.extraAmount) || 0),
            createdAt: pe?.createdAt ?? "",
          });
        } catch {
          setEstimate(null); // 견적이 아직 없으면 조용히 스킵
        }

        // 4) 프리셋 목록 (폼 사용 대비)
        if (!d.isCancelled && d.statusCode === "WAITING_FOR_REPAIR" && (isEngineer || isAdmin || isCustomer)) {
          const { data: presetRes } = await listPresets({ page: 0, size: 50 });
          const items = Array.isArray(presetRes?.items) ? presetRes.items : presetRes ?? [];
          setPresetList(
            items.map((p) => ({
              id: p.id ?? p.presetId ?? p.code ?? Math.random(),
              name: p.name ?? p.title ?? "프리셋",
              price: p.price ?? p.amount ?? 0,
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
  }, [requestId, isEngineer, isAdmin, isCustomer, location.pathname, navigate]);

  // 스텝 비교 (취소가 아니면서 현재 단계보다 뒤로 갔는지)
  const currentStep = RepairStatusMap["WAITING_FOR_REPAIR"];
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
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
          {estimate && <FirstEstimatePreview estimate={estimate} />}
          {/* 분기 내부의 엔지니어 카드는 제거됨 */}
        </div>
      ) : isCancelled ? (
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={true} requestId={requestId} />
          {estimate && <FirstEstimatePreview estimate={estimate} />}
          {/* 분기 내부의 엔지니어 카드는 제거됨 */}
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
              {/* 분기 내부의 엔지니어 카드는 제거됨 */}
            </div>
          )}

          {(isCustomer || isEngineer || isAdmin) && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
              <FirstEstimateForm presetList={presetList} />
            </div>
          )}
        </>
      )}

      {/* ✅ 공통 하단: 엔지니어 카드 (실데이터 없으면 더미 카드 표시) */}
      <SelectedEngineerCard engineer={engineerCard ?? DUMMY_ENGINEER} />
    </div>
  );
}