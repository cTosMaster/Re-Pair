const RepairRequestForm = ({ requestData }) => {
  return (
    <div className="bg-white p-4 rounded-md shadow w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">수리 요청서</h2>

      <div className="space-y-3 text-sm text-gray-700">
        <input
          type="text"
          value={requestData.title}
          disabled
          className="w-full border rounded p-2"
          placeholder="제목"
        />

        <select
          value={requestData.productName}
          disabled
          className="w-full border rounded p-2 bg-gray-100"
        >
          <option value="시계">시계</option>
          <option value="노트북">노트북</option>
        </select>

        <input
          type="tel"
          value={requestData.phone}
          disabled
          className="w-full border rounded p-2"
          placeholder="연락처"
        />

        <input
          type="text"
          value={requestData.zipCode}
          disabled
          className="w-full border rounded p-2"
          placeholder="우편번호"
        />

        <input
          type="text"
          value={requestData.address}
          disabled
          className="w-full border rounded p-2"
          placeholder="상세주소"
        />

        <textarea
          value={requestData.content}
          disabled
          rows={5}
          className="w-full border rounded p-2 resize-none"
          placeholder="수리 요청 내용"
        />
      </div>
    </div>
  );
};

export default RepairRequestForm;