import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TermsModal from "../modal/TermsModal";

const AgreementPage = () => {
  const navigate = useNavigate();
    const [allChecked, setAllChecked] = useState(false);
    const [checkedItems, setCheckedItems] = useState([false, false, false, false, false]);
    const [showModal, setShowModal] = useState(false);
  const [selectedTermIndex, setSelectedTermIndex] = useState(null);
  
  const handleSubmit = () => {
    if (checkedItems.slice(0, 3).every(Boolean)) {
      navigate("/companyFormContainer"); // '/companyregistration' 경로로 이동
    }
  };

    const handleAllCheck = () => {
        const newValue = !allChecked;
        setAllChecked(newValue);
        setCheckedItems(checkedItems.map(() => newValue));
    };

    const handleCheck = (index) => {
        const newCheckedItems = [...checkedItems];
        newCheckedItems[index] = !newCheckedItems[index];
        setCheckedItems(newCheckedItems);
        setAllChecked(newCheckedItems.every(Boolean));
    };
    const openModal = (index) => {
        setSelectedTermIndex(index);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedTermIndex(null);
    };
    
    // 임의의 약관 내용들
  const termContents = [
`(필수) re:pair 회원 약관 동의

본 약관은 Re:Pair(이하 ‘회사’)가 제공하는 통합 A/S 접수 및 처리 시스템(이하 ‘서비스’)의 이용 조건 및 절차, 회원과 회사의 권리·의무 및 책임사항, 서비스 이용과 관련한 기타 필요한 사항을 규정합니다.
회원은 본 약관에 동의함으로써 회사가 제공하는 모든 서비스 이용에 관한 제반 조건에 동의하는 것으로 간주되며, 약관에 명시되지 않은 사항에 대해서는 관계 법령 및 회사의 정책이 적용됩니다.`,
    
`(필수) 개인정보 수집 및 이용 동의

회사는 서비스 제공 및 원활한 고객 응대를 위하여 아래와 같은 개인정보를 수집 및 이용합니다.
- 수집 항목: 성명, 연락처(휴대전화번호, 이메일), 주소, A/S 요청 내역 등
- 이용 목적: 회원관리, A/S 접수 및 처리, 고객 상담, 서비스 제공 및 개선, 불만 처리 및 분쟁 해결
회사는 수집된 개인정보를 안전하게 관리하며, 개인정보 보호법 등 관련 법령에 따라 엄격히 보호합니다. 회원은 개인정보 제공에 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.`,
    
`(필수) 개인정보 처리 위탁에 관한 약관

회사는 고객의 A/S 처리 및 서비스 품질 향상을 위해 아래와 같은 업무를 외부 전문 업체에 위탁할 수 있으며, 위탁 받은 업체는 개인정보 보호법 등 관련 법령에 준수하여 개인정보를 처리합니다.
- 위탁 업무 내용: 수리 센터 운영, 결제 및 입금 처리, 배송 서비스 등
- 위탁 업체: [업체명 및 연락처 기재]
회사는 개인정보 위탁과 관련한 사항을 회원에게 투명하게 고지하며, 위탁 업체가 개인정보를 안전하게 처리하도록 관리·감독합니다.`,
    
`(선택) 마케팅 정보 활용 동의

회사는 회원에게 서비스 관련 최신 소식, 이벤트, 프로모션, 신규 서비스 안내 등 마케팅 정보를 아래 채널을 통해 제공할 수 있습니다.
- 정보 수단: 이메일, SMS, 전화, 앱 푸시 알림 등
회원은 본 동의를 거부할 권리가 있으며, 동의하지 않아도 서비스 이용에는 제한이 없습니다. 언제든지 마케팅 정보 수신을 거부하거나 설정 변경이 가능합니다.`,
    
`(선택) 마케팅 알림 수신 동의

회사는 할인 쿠폰, 특별 행사, 신상품 출시 등 다양한 마케팅 알림을 푸시 알림 형태로 회원에게 전송할 수 있습니다.
회원은 해당 알림 수신을 선택할 수 있으며, 알림 수신 동의를 하지 않아도 서비스 이용에는 영향이 없습니다. 알림 수신 설정은 언제든지 변경 가능합니다.

`,
  ];

  const agreementTexts = [
    "(필수) re:pair 회원 약관 동의",
    "(필수) 개인정보 수집 및 이용 동의",
    "(필수) 개인 정보 처리 위탁에 관한 약관",
    "(선택) 마케팅 정보 활용 동의",
    "(선택) 마케팅 알림 수신 동의",
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-[607px] bg-white px-10 py-12 border border-gray-200 rounded-xl shadow-xl">

        {/* 로고 */}
        <div className="text-[#9FC97B] text-3xl font-extrabold mb-12 text-center">
          Re:pair
        </div>

        {/* 타이틀 */}
        <h2 className="text-[24px] font-bold text-gray-800 leading-relaxed mb-8 text-center">
          Re:Pair 이용을 위해<br />약관에 동의해 주세요
        </h2>

        {/* 전체 동의 커스텀 체크박스 */}
        <div className="flex items-center mb-5">
          <input
            type="checkbox"
            id="all-check"
            checked={allChecked}
            onChange={handleAllCheck}
            className="hidden"
          />
          <label
            htmlFor="all-check"
            className={`w-5 h-5 flex items-center justify-center rounded border-2 cursor-pointer mr-3
              ${allChecked ? 'bg-[#9FC97B] border-[#9FC97B]' : 'border-gray-300'}`}
          >
            {allChecked && (
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </label>
          <span className="text-gray-800 font-medium text-base">
            아래 전체 내용에 동의합니다.
          </span>
        </div>

        <hr className="mb-5 border-gray-300" />

        {/* 각 약관 항목 커스텀 체크박스 */}
        {agreementTexts.map((text, index) => (
          <div key={index} className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`check-${index}`}
                checked={checkedItems[index]}
                onChange={() => handleCheck(index)}
                className="hidden"
              />
              <label
                htmlFor={`check-${index}`}
                className={`w-5 h-5 flex items-center justify-center rounded border-2 cursor-pointer mr-3
                  ${checkedItems[index] ? 'bg-[#9FC97B] border-[#9FC97B]' : 'border-gray-300'}`}
              >
                {checkedItems[index] && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </label>
              <span className="text-gray-700 text-sm">{text}</span>
            </div>

            {/* 약관 "보기" 버튼 */}
            <button
              onClick={() => openModal(index)}
              className="text-[#6A8B4E] text-xs font-medium underline hover:text-green-600 transition-colors"
            >
              보기
            </button>
          </div>
        ))}
              
        {/* 약관 설명 모달 보여주기 및 닫기 */}
            <TermsModal
            isOpen={showModal}
            onClose={closeModal}
            content={selectedTermIndex !== null ? termContents[selectedTermIndex] : ""}
            />

        {/* 등록하기 버튼 */}
        <button
          className={`w-full bg-[#73A647] text-white py-3 rounded-lg font-semibold mt-10 text-base hover:bg-[#9FC97B] transition-colors ${
            checkedItems.slice(0, 3).every(Boolean) ? "" : " cursor-not-allowed"
          }`}
          disabled={!checkedItems.slice(0, 3).every(Boolean)}
          onClick={handleSubmit}
        >
          등록하기
        </button>
      </div>
    </div>
  );
};

export default AgreementPage;
