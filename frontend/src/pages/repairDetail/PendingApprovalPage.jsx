import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// 기존 컴포넌트 유지
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import RepairRequestPreview from "../../components/repairdetail/pendingapproval/RepairRequestPreview";
import EngineerSelectList from "../../components/repairdetail/pendingapproval/EngineerSelectList";
import ApprovalActions from "../../components/repairdetail/pendingapproval/ApprovalActions";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";

// 서비스(API)
import { getRequestHistory } from "../../services/commonAPI";
import { getRepairRequest, listEngineers } from "../../services/customerAPI";

// 상태 맵
import { RepairStatusMap } from "../../constants/repairStatus";

/** 백엔드 상태 → 프론트 UI 상태 변환 */
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

/** 이력 배열 → 현재 상태/취소 여부/사유 도출 */
const deriveStatusFromHistory = (history = []) => {
  if (!Array.isArray(history) || history.length === 0) {
    return { statusCode: "PENDING_APPROVAL", isCancelled: false, cancelReason: null };
  }
  // ✅ 백엔드/프론트 혼용 대비: 전체를 UI 코드로 정규화
  const norm = history.map((h) => ({
    ...h,
    previousStatus: toUiStatus(h?.previousStatus),
    newStatus: toUiStatus(h?.newStatus),
  }));
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
  const { requestId: _rid } = useParams(); // 라우터에서 :requestId 받는다고 가정
  const requestId = _rid ?? "";
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // 화면 상태
  const [loading, setLoading] = useState(true);
  const [statusCode, setStatusCode] = useState("PENDING_APPROVAL");
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelReason, setCancelReason] = useState(null);

  // 프리뷰/기사 리스트
  const [categoryData, setCategoryData] = useState(null);
  const [engineerList, setEngineerList] = useState([]);

  // 역할 안전 계산
  const role = useMemo(() => user?.role ?? "GUEST", [user]);
  const isUser = role === "USER";
  const isCustomer = role === "CUSTOMER";
  const isEngineer = role === "ENGINEER";
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        setLoading(true);

        if (!requestId) {
          console.warn("Missing requestId in route params");
          setLoading(false);
          return;
        }

        // 1) 상태 이력 조회
        const history = await getRequestHistory(requestId, { signal: ac.signal });
        const d = deriveStatusFromHistory(history);
        setStatusCode(d.statusCode);
        setIsCancelled(d.isCancelled);
        setCancelReason(d.cancelReason);

        // 2) 요청 상세 (프리뷰용)
        const { data: detail } = await getRepairRequest(requestId, { signal: ac.signal });
        setCategoryData({
          title: detail?.title ?? "",
          category: detail?.categoryName ?? "",
          product: detail?.productName ?? "",
          phone: detail?.contactPhone ?? "",
          content: detail?.description ?? "",
        });

        // 3) 기사 목록
        //  └ 현재 listEngineers가 params만 받는 시그니처라 signal은 제외(A안)
        const { data: engRes } = await listEngineers({ page: 0, size: 20 });
        const engineers = Array.isArray(engRes?.items) ? engRes.items : engRes ?? [];
        setEngineerList(
          engineers.map((e) => ({
            id: e.id,
            name: e.name || e.username || e.email || "이름없음",
            email: e.email ?? "",
            phone: e.phone ?? "",
            status: !!e.assigned, // 필요 시 실제 필드명 맞게 조정
            profileImage: e.imageUrl ?? null,
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [requestId]);

  // 스텝 비교 (취소면 과거단계 분기보다 우선)
  const currentStep = RepairStatusMap["PENDING_APPROVAL"];
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
          <RepairProgress
            statusCode={statusCode}
            isCancelled={isCancelled}
            requestId={requestId}     // ✅ 추가
          />
          <RepairRequestPreview categoryData={categoryData || {}} />
        </div>
      ) : isCancelled ? (
        <div className="space-y-6 text-gray-600">
          <RepairProgress
            statusCode={statusCode}
            isCancelled={true}
            requestId={requestId}     // ✅ 추가
          />
          <RepairRequestPreview categoryData={categoryData || {}} />
          <RejectReasonBox reason={cancelReason} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-6">
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
                requestId={requestId}   // ✅ 추가
              />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                접수 대기 상태입니다.
              </div>
            </div>
          )}

          {isCustomer && (
            <div className="space-y-6">
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
                requestId={requestId}   // ✅ 추가
              />
              <RepairRequestPreview categoryData={categoryData || {}} />
              <EngineerSelectList engineerList={engineerList} />
              <ApprovalActions />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-6">
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
                requestId={requestId}   // ✅ 추가
              />
              <RepairRequestPreview categoryData={categoryData || {}} />
              <EngineerSelectList engineerList={engineerList} />
              <ApprovalActions />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-6">
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
                requestId={requestId}   // ✅ 추가
              />
              <RepairRequestPreview categoryData={categoryData || {}} />
            </div>
          )}

          {!isUser && !isCustomer && !isEngineer && !isAdmin && (
            <div className="space-y-6">
              <RepairProgress
                statusCode={statusCode}
                isCancelled={isCancelled}
                requestId={requestId}   // ✅ 추가
              />
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