import React, { useState } from "react";
import CompanyInfoForm from "./CompanyInfoForm";
import CompanyInfoFormStepTwo from "./CompanyInfoFormStepTwo";

const CompanyFormContainer = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-xl">
        <h2 className="fixed top-4 left-16 text-[#9fc87b] font-bold text-2xl z-10">
          Re:pair
        </h2>
        {step === 1 ? (
          <CompanyInfoForm onNext={nextStep} />
        ) : (
          <CompanyInfoFormStepTwo onBack={prevStep} />
        )}
      </div>
    </div>
  );
};

export default CompanyFormContainer;
