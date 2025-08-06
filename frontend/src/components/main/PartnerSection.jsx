import { useState } from "react";

const partnerData = [
  { name: "신속전자 A/S", desc: "믿을 수 있는 빠른 수리 서비스", location: "서울 강남구" },
  { name: "한빛전자 서비스센터", desc: "합리적인 가격의 수리 전문", location: "부산 해운대구" },
  { name: "드림전자 A/S", desc: "전국망을 통한 편리한 A/S", location: "대구 중구" },
  { name: "에이스리페어", desc: "친절한 상담과 확실한 수리", location: "인천 남동구" },
  { name: "수리왕전자", desc: "전문 엔지니어 상주 수리센터", location: "대전 서구" },
];

const PartnerSection = () => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;

  const nextSlide = () => {
    setStartIndex((prev) => (prev + 1) % partnerData.length);
  };

  const prevSlide = () => {
    setStartIndex((prev) => (prev - 1 + partnerData.length) % partnerData.length);
  };

  const visiblePartners = [...partnerData, ...partnerData].slice(startIndex, startIndex + visibleCount);

  return (
    <section className="py-16 px-6 bg-white">
      <h2 className="text-3xl font-bold text-center mb-10">제휴 A/S 센터</h2>
      <div className="relative max-w-6xl mx-auto">
        <div className="flex gap-6 overflow-hidden transition-all duration-300">
          {visiblePartners.map((partner, idx) => (
            <div key={idx} className="min-w-[300px] bg-gray-100 p-6 rounded-xl shadow text-left">
              <h3 className="text-xl font-semibold mb-2">{partner.name}</h3>
              <p className="text-sm text-gray-700 mb-1">{partner.desc}</p>
              <p className="text-xs text-gray-500">{partner.location}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={prevSlide} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            ◀ 이전
          </button>
          <button onClick={nextSlide} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            다음 ▶
          </button>
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
