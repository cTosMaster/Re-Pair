import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanyInfoForm from "./CompanyInfoForm";
import CompanyInfoFormStepTwo from "./CompanyInfoFormStepTwo";
import { submitCustomerRegistration } from "../../services/customerAPI";
import Header from "../../layouts/Header";

export default function CompanyFormContainer() {
  const [step, setStep] = useState(1);
  const [step1, setStep1] = useState(null); // 1단계 데이터(주소/좌표 포함)
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleNextFromStep1 = (data) => {
    setStep1(data);
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSubmitStep2 = async (s2) => {
    if (!step1) return;

    const dto = {
      termsAgreed: !!s2.termsAgreed,
      companyName: step1.companyName,
      companyNumber: step1.registrationNumber,
      contactName: step1.ceoName,
      contactEmail: s2.contactEmail,
      contactPhone: step1.phone,
      businessDocUrl: s2.businessDocUrl,
      openingHours: s2.openingHours,
      postalCode: step1.postalCode,
      roadAddress: step1.roadAddress,
      detailAddress: step1.detailAddress || "",
      lat: step1.lat,
      lng: step1.lng,
      categoryIds: s2.categoryIds,
    };

    if (dto.lat == null || dto.lng == null) {
      alert("주소 좌표를 확인해주세요. 주소검색 후 다시 시도해주세요.");
      setStep(1);
      return;
    }
    if (!dto.termsAgreed) {
      alert("약관에 동의해야 합니다.");
      return;
    }
    if (!dto.businessDocUrl) {
      alert("증빙 서류 URL을 입력하세요.");
      return;
    }
    if (!dto.categoryIds?.length) {
      alert("하나 이상의 카테고리 ID를 입력하세요.");
      return;
    }

    try {
      setSubmitting(true);
      await submitCustomerRegistration(dto);
      alert("등록 요청이 접수되었습니다. 관리자 승인 대기 상태입니다.");
      navigate("/customer/main", { replace: true });
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || "등록 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/*  최상단 네비게이션 */}
      <Header />
      
      <div className="flex items-start justify-center px-4 mt-4">
        <div className="w-full max-w-xl">
          {step === 1 ? (
            <CompanyInfoForm onNext={handleNextFromStep1} />
          ) : (
            <CompanyInfoFormStepTwo
              onBack={handleBack}
              onSubmit={handleSubmitStep2}
              submitting={submitting}
            />
          )}
        </div>
      </div>
    </div>
  );
}