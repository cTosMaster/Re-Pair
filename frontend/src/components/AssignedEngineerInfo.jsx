const AssignedEngineerInfo = ({ name, phone }) => {
    
  return (
    <div className="bg-white p-4 rounded-md shadow w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">담당 수리기사</h2>

      <div className="text-sm text-gray-700 space-y-2">
        <div className="flex items-center">
          <span className="w-24 font-medium">이름</span>
          <span>{name}</span>
        </div>
        <div className="flex items-center">
          <span className="w-24 font-medium">연락처</span>
          <span>{phone}</span>
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-green-600">
        수리기사 배정이 완료되었습니다.
      </div>
    </div>
  );
};

export default AssignedEngineerInfo;