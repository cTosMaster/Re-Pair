import React from "react";

const CompanyInfoForm = ({ onNext }) => {
  return (
    <div className="mt-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">회사 정보를 입력해 주세요</h1>
        <span className="text-[#6b8b4e] text-sm">1/2</span>
      </div>

      <form className="space-y-5">
        {/* 회사명 */}
        <div>
            <label className="block mb-1">
            회사명 <span className="text-red-500">*</span>
            </label>
            <input
            type="text"
            name="companyName"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{width:"492px",height: "48px"}}
            />
        </div>

        {/* 사업자 등록번호 */}
        <div>
            <label className="block mb-1">
            사업자 등록번호 <span className="text-red-500">*</span>
            </label>
            <input
            type="text"
            name="registrationNumber"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{width:"492px",height: "48px"}}
            />
        </div>

        {/* 업체 주소 */}
        <div>
            <label className="block mb-1">
            업체 주소 <span className="text-red-500">*</span>
            </label>
            <input
            type="text"
            name="address"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{width:"492px", height: "48px"}}
            />
        </div>

        {/* 대표자명 */}
        <div>
            <label className="block mb-1">
            대표자명 <span className="text-red-500">*</span>
            </label>
            <input
            type="text"
            name="ceoName"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{width:"492px",height: "48px"}}
            />
        </div>

        {/* 대표 전화번호 */}
        <div>
            <label className="block mb-1">
            대표 전화번호 <span className="text-red-500">*</span>
            </label>
            <input
            type="tel"
            name="phone"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{width:"492px",height: "48px"}}
            />
        </div>


        <button
          type="button"
          onClick={onNext}
                  className="w-full bg-[#a3cd7f] text-white font-bold py-2 rounded mt-6 rounded-lg"
                   style={{width:"492px",height: "48px"}}
        >
          다음
        </button>
      </form>
    </div>
  );
};

export default CompanyInfoForm;
