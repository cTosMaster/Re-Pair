const steps = [
  {
    icon: "🧾",
    title: "어떤 수리를 원하시나요?",
    description: "업체 목록에서 원하시는 항목과\n수리 업체를 골라보세요.",
  },
  {
    icon: "💰",
    title: "견적은 미리 확인!",
    description: "수리 신청을 통해\n1차 견적서를 확인하세요.",
  },
  {
    icon: "🛠️",
    title: "수리 진행 상황은?",
    description: "수리 상태를\n실시간으로 확인할 수 있습니다. \n My 수리견적에서 확인하세요.",
  },
  {
    icon: "📦",
    title: "수리 완료도 깔끔하게!",
    description: "수리가 끝나면\n택배로 안전하게 전달됩니다.",
  },
];

const StepGuide = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 px-6">
        {steps.map((s, i) => (
          <div key={i} className="flex items-start">
            <div className="text-3xl md:text-4xl mr-3 select-none" aria-hidden="true">
              {s.icon}
            </div>
            <div>
              <h3 className="text-[#6a8a4d] font-bold text-lg md:text-xl mb-1">
                {s.title}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StepGuide;