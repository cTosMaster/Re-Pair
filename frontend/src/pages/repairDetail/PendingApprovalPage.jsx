import { RepairStatusMap } from "../../constants/repairStatus";
import RepairProgress from "../../components/repairdetail/common/RepairProgress";
import RepairRequestPreview from "../../components/repairdetail/pendingapproval/RepairRequestPreview";
import EngineerSelectList from "../../components/repairdetail/pendingapproval/EngineerSelectList";
import ApprovalActions from "../../components/repairdetail/pendingapproval/ApprovalActions";
import RejectReasonBox from "../../components/repairdetail/common/RejectReasonBox";
import { dummyUser } from "./dummyUser";

function PendingApprovalPage() {
  const userData = {
    role: dummyUser.role, // "USER" | "CUSTOMER" | "ENGINEER" | "ADMIN"
    repair: {
      statusCode: dummyUser.repair.statusCode, // 수리 상태코드
      isCancelled: dummyUser.repair.isCancelled,             // 취소 여부
    },
  };

  const categoryData = {
    title: "고장난 시계 수리 요청",
    category: "시계",
    product: "로렉스 데이저스트",
    phone: "01012345678",
    content: "유리가 깨졌고 내부 부품이 멈췄습니다.",
  };

  const engineerList = [
    // 대기 중
    {
      id: 1,
      name: "김정비",
      email: "kim1@example.com",
      phone: "010-1111-2222",
      status: false,
      profileImage: null,
    },
    {
      id: 3,
      name: "박수리",
      email: "park3@example.com",
      phone: "010-3333-4444",
      status: false,
      profileImage: null,
    },
    {
      id: 4,
      name: "최정비",
      email: "choi4@example.com",
      phone: "010-4444-5555",
      status: false,
      profileImage: null,
    },
    {
      id: 6,
      name: "한수리",
      email: "han6@example.com",
      phone: "010-6666-7777",
      status: false,
      profileImage: null,
    },
    {
      id: 7,
      name: "서정비",
      email: "seo7@example.com",
      phone: "010-7777-8888",
      status: false,
      profileImage: null,
    },
    {
      id: 9,
      name: "백정비",
      email: "baek9@example.com",
      phone: "010-9999-0000",
      status: false,
      profileImage: null,
    },
    {
      id: 10,
      name: "유기술",
      email: "yoo10@example.com",
      phone: "010-0000-1111",
      status: false,
      profileImage: null,
    },

    // 배정 됨
    {
      id: 2,
      name: "이수리",
      email: "lee2@example.com",
      phone: "010-2222-3333",
      status: true,
      profileImage: "https://i.pravatar.cc/100?img=1",
    },
    {
      id: 5,
      name: "정기사",
      email: "jung5@example.com",
      phone: "010-5555-6666",
      status: true,
      profileImage: "https://i.pravatar.cc/100?img=2",
    },
    {
      id: 8,
      name: "홍수리",
      email: "hong8@example.com",
      phone: "010-8888-9999",
      status: true,
      profileImage: "https://i.pravatar.cc/100?img=3",
    },
  ];

  const reason = {
    message: "요청 내용이 불분명하여 수리를 진행할 수 없습니다.",
  };

  const { role, repair } = userData;
  const { statusCode, isCancelled } = repair;

  const currentStep = RepairStatusMap["PENDING_APPROVAL"];
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
          <RepairRequestPreview categoryData={categoryData}/>
        </div>
      ) : isCancelled ? (
        <div className="space-y-4 text-gray-600 mt-8">
          <RepairProgress statusCode={statusCode} isCancelled={true} />
          <RepairRequestPreview categoryData={categoryData} />
          <RejectReasonBox reason={reason.message} />
        </div>
      ) : (
        <>
          {isUser && (
            <div className="space-y-4">
              {/* USER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm text-center">
                접수 대기 상태입니다.
              </div>
            </div>
          )}

          {isCustomer && (
            <div className="space-y-4">
              {/* CUSTOMER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <RepairRequestPreview categoryData={categoryData}/>
              <EngineerSelectList engineerList={engineerList} />
              <ApprovalActions />
              
            </div>
          )}

          {isEngineer && (
            <div className="space-y-4">
              {/* ENGINEER용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <RepairRequestPreview categoryData={categoryData}/>
              <EngineerSelectList engineerList={engineerList} />
              <ApprovalActions />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-4">
              {/* ADMIN용 컴포넌트 삽입 위치 */}
              <RepairProgress statusCode={statusCode} isCancelled={isCancelled} />
              <RepairRequestPreview categoryData={categoryData}/>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PendingApprovalPage;