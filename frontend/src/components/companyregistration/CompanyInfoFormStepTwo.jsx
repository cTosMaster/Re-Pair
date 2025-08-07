import React from "react";
import PropTypes from "prop-types";

const CompanyInfoFormStepTwo = ({ onBack }) => {
  return (
    <div className="mt-32">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl ">회사 정보를 입력해 주세요</h1>
        <span className="text-[#6b8b4e] text-sm">2/2</span>
      </div>

      <form className="space-y-5">
        <div>
          <label className="block mb-2">
            업체 이메일 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{width:"492px",height: "48px"}}
          />
        </div>

        <div>
          <label className="block mb-2">영업시간</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-4 py-2"
            style={{width:"492px",height: "48px"}}
          />
        </div>

        <div>
          <label className="block mb-2">
            증빙 서류 추가 <span className="text-red-500">*</span>
          </label>
          <div className="relative w-[492px] h-[48px]">
            <input
              type="file"
              className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10"
              style={{width:"492px",height: "48px"}}            
            />
            <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 pointer-events-none">
               ✚
            </span>
          </div>
        </div>

        <div>
          <label className="block mb-2">업체 프로필 (선택)</label>
          <div className="relative w-[492px] h-[48px]">
            <input
              type="file"
              className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10"
              style={{width:"492px",height: "48px"}}
            />
            <span className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
              ✚
            </span>
          </div>
        </div>

        <div>
          <label className="block mb-2 ">카테고리</label>
          <select className="w-full border border-gray-300 rounded-md px-4 py-2" style={{width:"492px",height: "48px"}}>
            <option>선택해주세요</option>
            <option>휴대폰</option>
            <option>UMPC</option>
            <option>모니터</option>
            <option>전자시계</option>
            <option>기계식 키보드</option>
          </select>
        </div>

        <button
          type="submit"
                  className="w-full bg-[#a3cd7f] text-white font-bold py-2 rounded mt-6 rounded-lg"
                  style={{width:"492px",height: "48px"}}
        >
          등록하기
        </button>

        {/* 뒤로가기 버튼 */}
        <button
          type="button"
          onClick={onBack}
          className="w-full text-[#6b8b4e] font-medium py-2 rounded mt-2 pr-23"
        >
          ← 이전 단계로
        </button>
      </form>
    </div>
  );
};

CompanyInfoFormStepTwo.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default CompanyInfoFormStepTwo;
