import bannerImg from "../../assets/products.png"; // 실제 이미지 위치에 맞게 조정 필요

const LandingProductBanner = () => {
  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* 이미지 */}
        <img
          src={bannerImg}
          alt="제품 이미지"
          className="w-full md:w-1/2 max-w-md object-contain"
        />

        {/* 텍스트 */}
        <div className="text-center md:text-left">
          <h3 className="text-2xl font-bold text-green-700 mb-4">
            수리 이제 간편하게 신청하세요
          </h3>
          <p className="text-gray-700 text-sm">
            수리 이제 간편하게 신청하세요
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingProductBanner;