function RepairEngineerSelector({ engineers = [], selectedId, onSelect }) {
  return (
    <div className="bg-white p-4 rounded-md shadow w-full max-w-3xl mx-auto mt-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">수리기사 선택</h2>

      <div className="overflow-y-auto max-h-80 border rounded">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-2 border bg-gray-100">이름</th>
              <th className="p-2 border bg-gray-100">이메일</th>
              <th className="p-2 border bg-gray-100">연락처</th>
              <th className="p-2 border bg-gray-100">상태</th>
              <th className="p-2 border bg-gray-100">선택</th>
            </tr>
          </thead>
          <tbody>
            {engineers.map((engineer) => {
              const isSelected = selectedId === engineer.id;
              const isAssigned = engineer.assigned;

              return (
                <tr
                  key={engineer.id}
                  className={`hover:bg-gray-50 ${
                    isSelected ? 'bg-yellow-100' : ''
                  }`}
                >
                  <td className="p-2 border">{engineer.name}</td>
                  <td className="p-2 border">{engineer.email}</td>
                  <td className="p-2 border">{engineer.phone}</td>
                  <td className="p-2 border">
                    {isAssigned ? '배정됨' : '대기중'}
                  </td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => {
                        if (!isAssigned) onSelect(engineer.id);
                      }}
                      disabled={isAssigned}
                      className={`px-3 py-1 rounded text-sm border transition ${
                        isAssigned
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      선택
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RepairEngineerSelector;