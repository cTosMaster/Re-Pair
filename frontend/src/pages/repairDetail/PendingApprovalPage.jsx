import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import RepairRequestPreview from "../../components/repairdetail/pendingapproval/RepairRequestPreview";
import EngineerSelectList from "../../components/repairdetail/pendingapproval/EngineerSelectList";
import ApprovalActions from "../../components/repairdetail/pendingapproval/ApprovalActions";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";

import { getRequestHistory } from "../../services/commonAPI";
import { getCustomerRepairRequestDetail, listEngineers } from "../../services/customerAPI";

import { RepairStatusMap } from "../../constants/repairStatus";
import { segmentForStatus } from "../../routes/statusRoute";

/** 백엔드 상태 → UI 코드 */
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

const fromKoToUi = (ko) =>
  ({
    접수대기: "PENDING_APPROVAL",
    수리대기: "WAITING_FOR_REPAIR",
    수리중: "IN_PROGRESS",
    결제대기: "WAITING_FOR_PAYMENT",
    발송대기: "WAITING_FOR_DELIVERY",
    배송대기: "WAITING_FOR_DELIVERY",
    발송완료: "COMPLETED",
    배송완료: "COMPLETED",
    취소: "CANCELLED",
  }[ko] ?? ko);

const isEnum = (s) => typeof s === "string" && /^[A-Z_]+$/.test(s);

/** 이력 → 현재 상태/취소 여부/사유 도출 (from/to 한글도 흡수) */
const deriveStatusFromHistory = (history = []) => {
  if (!Array.isArray(history) || history.length === 0) {
    return { statusCode: "PENDING_APPROVAL", isCancelled: false, cancelReason: null };
  }
  const norm = history.map((h) => {
    const prevRaw = h?.previousStatus ?? h?.from;
    const nextRaw = h?.newStatus ?? h?.to;
    const previousStatus = isEnum(prevRaw) ? toUiStatus(prevRaw) : fromKoToUi(prevRaw);
    const newStatus = isEnum(nextRaw) ? toUiStatus(nextRaw) : fromKoToUi(nextRaw);
    return { ...h, previousStatus, newStatus };
  });
  const last = norm[norm.length - 1];
  const statusCode = last?.newStatus ?? "PENDING_APPROVAL";
  const canceledItem = [...norm].reverse().find((h) => h?.newStatus === "CANCELLED");
  return {
    statusCode,
    isCancelled: statusCode === "CANCELLED",
    cancelReason: canceledItem?.memo ?? null,
  };
};

export default function PendingApprovalPage() {
  const { requestId: _rid } = useParams();
  const requestId = _rid ?? "";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // 화면 상태
  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState("PENDING_APPROVAL");
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelReason, setCancelReason] = useState();

  // 프리뷰/기사
  const [categoryData, setCategoryData] = useState(null);
  const [engineerList, setEngineerList] = useState([]);
  const [selectedEngineerId, setSelectedEngineerId] = useState(null);

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

        // 1) 이력 조회 → 상태/사유
        const history = await getRequestHistory(requestId, { signal: ac.signal });
        const d = deriveStatusFromHistory(history);
        setStatusCode(d.statusCode);
        setIsCancelled(d.isCancelled);
        setCancelReason(d.cancelReason);

        // 자동 경로 교정 (peek이면 스킵)
        const isPeek = location.state?.peek === true || new URLSearchParams(location.search).has("peek");
        if (!isPeek) {
          const expectedSeg = segmentForStatus(d.statusCode);
          const endsWithExpected = location.pathname.endsWith(`/${expectedSeg}`);
          if (!endsWithExpected) {
            navigate(`/repair-requests/${encodeURIComponent(requestId)}/${expectedSeg}`, { replace: true });
            return;
          }
        }

        // 2) 상세 조회 (프리뷰 + 상태/사유 보정)
        const { data } = await getCustomerRepairRequestDetail(requestId);
        const req = data?.request ?? data;
        setCategoryData({
          title: req?.title ?? "",
          category: req?.category?.name ?? "",
          product: req?.item?.name ?? "",
          phone: req?.phone ?? "",
          content: req?.content ?? "",
        });

        const statusObj = data?.status ?? req?.status ?? null;
        const detailUi = statusObj?.code ? toUiStatus(statusObj.code) : null;
        if (detailUi) {
          setStatusCode(detailUi);
          setIsCancelled(detailUi === "CANCELLED");
        }
        const lastCancel = statusObj?.lastReasons?.cancel ?? null;
        if (lastCancel != null && lastCancel !== "") {
          setCancelReason(lastCancel);
        }

        // 3) 기사 목록
        const { data: engRes } = await listEngineers({ page: 0, size: 20 });
        const engineersRaw = Array.isArray(engRes?.content)
          ? engRes.content
          : Array.isArray(engRes?.items)
          ? engRes.items
          : Array.isArray(engRes)
          ? engRes
          : [];

        const mapped = engineersRaw.map((e) => {
          const id = e.engineerId ?? e.id;
          const assigned =
            typeof e.assigned === "boolean"
              ? e.assigned
              : e.statusLabel
              ? e.statusLabel !== "대기 중"
              : false;
          return {
            id,
            name: e.name || e.username || e.email || "이름없음",
            email: e.email ?? "",
            phone: e.phone ?? "",
            status: assigned, // 배정 여부
            statusText: e.statusLabel ?? (assigned ? "배정됨" : "대기 중"),
            profileImage: e.imageUrl ?? e.profileImage ?? null,
            registeredAt: e.registeredAt ?? null,
          };
        });

        setEngineerList(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [requestId, location.pathname, navigate]);

  // 선택값 유효성 유지 (목록이 바뀌거나 해당 엔지니어가 배정된 경우 해제)
  useEffect(() => {
    if (selectedEngineerId == null) return;
    const ok = engineerList.some((e) => e.id === selectedEngineerId && !e.status);
    if (!ok) setSelectedEngineerId(null);
  }, [engineerList, selectedEngineerId]);

  const currentStep = RepairStatusMap["PENDING_APPROVAL"];
  const userStep = RepairStatusMap[statusCode] ?? 0;
  const isPastStep = !isCancelled && userStep > currentStep;

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
          <RepairRequestPreview categoryData={categoryData || {}} />
        </div>
      ) : isCancelled ? (
        <div className="space-y-6 text-gray-600">
          <RepairProgress statusCode={statusCode} isCancelled={true} requestId={requestId} />
          <RepairRequestPreview categoryData={categoryData || {}} />
          <RejectReasonBox reason={cancelReason} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                접수 대기 상태입니다.
              </div>
            </div>
          )}

          {isCustomer && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
              <RepairRequestPreview categoryData={categoryData || {}} />
              <EngineerSelectList
                engineerList={engineerList}
                selectedId={selectedEngineerId}
                onChange={setSelectedEngineerId}
              />
              <ApprovalActions
                engineerId={selectedEngineerId}
                requireEngineerId
              />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
              <RepairRequestPreview categoryData={categoryData || {}} />
              <EngineerSelectList
                engineerList={engineerList}
                selectedId={selectedEngineerId}
                onChange={setSelectedEngineerId}
              />
              <ApprovalActions
                engineerId={selectedEngineerId} // 선택했으면 명시, 미선택이면 자동배정
              />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
              <RepairRequestPreview categoryData={categoryData || {}} />
            </div>
          )}

          {!isUser && !isCustomer && !isEngineer && !isAdmin && (
            <div className="space-y-6">
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} requestId={requestId} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                권한을 확인 중입니다…
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}