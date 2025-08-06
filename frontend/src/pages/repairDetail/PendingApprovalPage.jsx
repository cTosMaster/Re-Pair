import RepairProgress from "../../components/repairDetail/RepairProgress"; // .jsx 확장자는 생략하는 것이 일반적입니다.

function PendingApprovalPage(){
    return (
        <div>
            <h2>접수 대기</h2>
            <RepairProgress statusCode="PENDING_APPROVAL" />
        </div>
    );
}

export default PendingApprovalPage;