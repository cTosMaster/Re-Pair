import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import { dummyUser } from "./dummyUser";
import DeliveryCompleteButton from "../../components/repairdetail/waitingfordelivery/DeliveryCompleteButton";
import SelectedCompanyCard from "../../components/repairdetail/common/SelectedCompanyCard";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";

function WaitingForDeliveryPage() {
  const userData = {
    role: dummyUser.role, // "USER" | "CUSTOMER" | "ENGINEER" | "ADMIN"
    repair: {
      statusCode: dummyUser.repair.statusCode, // 수리 상태코드
      isCancelled: dummyUser.repair.isCancelled,             // 취소 여부
    },
  };

  const dummyCompany = {
    name: "수리나라 테크",
    email: "contact@repairtech.co.kr",
    phone: "02-1234-5678",
    profileImage: "https://via.placeholder.com/150", // 테스트용 이미지
  };

  const reason = {
    message: "요청 내용이 불분명하여 수리를 진행할 수 없습니다.",
  };

  const completedDate = "2025.08.08";

  const { role, repair } = userData;
  const { statusCode, isCancelled } = repair;

  const currentStep = RepairStatusMap["WAITING_FOR_DELIVERY"];
  const userStep = RepairStatusMap[statusCode];
  const isPastStep = userStep > currentStep;

  const isUser = role === "USER";
  const isCustomer = role === "CUSTOMER";
  const isEngineer = role === "ENGINEER";
  const isAdmin = role === "ADMIN";

  return (
    <div className="p-6 space-y-6">
      {isPastStep ? (
        <div className="text-gray-600 mt-8">
          {/* 과거 진행 요약 정보 컴포넌트 삽입 위치 */}
          <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
          <p className="text-center">
            {completedDate} <br />
            완료된 수리입니다.
          </p>
        </div>
      ) : isCancelled ? (
        <div className="space-y-4 text-gray-600 mt-8">
          {/* 취소 상태용 컴포넌트 삽입 위치 */}
          <RepairProgress statusCode={statusCode} isCancelled={true} />
          <p className="text-center">
            {completedDate} <br />
            완료된 수리입니다.
          </p>
          <RejectReasonBox reason={reason.message} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-4">
              {/* USER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                <p>  
                  이용해주셔서 감사합니다.<br />
                  현재 배송준비 상태입니다.
                </p> 
              </div>
              <SelectedCompanyCard company={dummyCompany} />
            </div>
          )}

          {isCustomer && (
            <div className="space-y-4">
              {/* CUSTOMER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                <p>
                  {completedDate} <br />
                  완료된 수리입니다.
                </p>
              </div>
              <DeliveryCompleteButton />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-4">
              {/* ENGINEER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                <p>
                  {completedDate} <br />
                  완료된 수리입니다.
                </p>
              </div>
              <DeliveryCompleteButton />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-4">
              {/* ADMIN용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                <p>
                  {completedDate} <br />
                  완료된 수리입니다.
                </p>
              </div>
              <DeliveryCompleteButton />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default WaitingForDeliveryPage;