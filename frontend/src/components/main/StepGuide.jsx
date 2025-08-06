const steps = [
  {
    title: "01. 수리 요청",
    description: "간단한 정보 입력만으로 A/S 요청을 시작하세요.",
  },
  {
    title: "02. 견적 비교",
    description: "여러 수리업체의 견적을 비교하고 선택할 수 있어요.",
  },
  {
    title: "03. 수리 완료",
    description: "수리 진행 상황을 실시간으로 확인하고 완료 후 리뷰까지!",
  },
];

const StepGuide = () => {
  return (
    <section className="bg-gray-50 py-16 px-6">
      <h2 className="text-3xl font-bold text-center mb-12">이용 절차 안내</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition"
          >
            <div className="text-blue-600 text-2xl font-bold mb-2">{step.title}</div>
            <p className="text-gray-700 text-base">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StepGuide;