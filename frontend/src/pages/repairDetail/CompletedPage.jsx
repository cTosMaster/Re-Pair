import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import { dummyUser } from "./dummyUser";
import ReviewForm from "../../components/repairdetail/completed/ReviewForm";
import SelectedCompanyCard from "../../components/repairdetail/common/SelectedCompanyCard";
import ReviewPreview from "../../components/repairdetail/completed/ReviewPreview";

function CompletedPage() {
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

  const dummyReview = {
    rating: 4, // 0~5 범위
    text: "수리 상태가 아주 만족스러웠습니다.\n빠른 처리 감사합니다!",
    author: "홍길동",
    dateText: "2025.08.08",
  };

  const { role, repair } = userData;
  const { statusCode, isCancelled } = repair;

  const currentStep = RepairStatusMap["COMPLETED"];
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
          <ReviewPreview rating={null} text={null} author={null} dateText={null} /> 
        </div>
      ) : isCancelled ? (
        <div className="space-y-4 text-gray-600 mt-8">
          {/* 취소 상태용 컴포넌트 삽입 위치 */}
          <RepairProgress statusCode={statusCode} isCancelled={true} />
          <ReviewPreview rating={null} text={null} author={null} dateText={null} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-4">
              {/* USER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <ReviewForm />
              <SelectedCompanyCard company={dummyCompany} />
            </div>
          )}

          {isCustomer && (
            <div className="space-y-4">
              {/* CUSTOMER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <ReviewPreview rating={null} text={null} author={null} dateText={null} />
            </div>
          )}

          {isEngineer && (
            <div className="space-y-4">
              {/* ENGINEER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <ReviewPreview rating={null} text={null} author={null} dateText={null} />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-4">
              {/* ADMIN용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <ReviewPreview
                rating={dummyReview.rating}
                text={dummyReview.text}
                author={dummyReview.author}
                dateText={dummyReview.dateText}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CompletedPage;