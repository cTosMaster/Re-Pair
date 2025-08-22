const HeroSection = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-20 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-[#6a8a4d] text-3xl md:text-4xl font-bold">
          세상의 모든 수리
        </h1>
        <div className="text-[#6a8a4d] text-2xl md:text-3xl font-extrabold mt-2">
          Re:pair
        </div>

        <p className="text-gray-500 mt-6 leading-relaxed">
          체계적인 흐름, 간편한 이용
          <br className="hidden sm:block" />
          기업도, 고객도 만족하는 수리 플랫폼입니다.
        </p>

        {/* 하단 얇은 초록 라인 */}
        <div className="h-[2px] bg-[#6a8a4d] w-[86%] mx-auto mt-14"></div>
      </div>
    </section>
  );
};

export default HeroSection;