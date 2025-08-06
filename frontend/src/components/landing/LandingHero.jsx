import { Link } from "react-router-dom";
import heroBg from "../../assets/hero-banner.png";

const LandingHero = () => {
  return (
    <section
      className="relative bg-cover bg-center text-white py-32 px-6 text-center min-h-[600px]"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* 텍스트 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow">
          수리 이제 간편하게 신청하세요
        </h2>
        <div className="mt-auto pt-10">
          <Link
            to="/login"
            className="bg-green-500 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-600 transition drop-shadow"
          >
            수리하기
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;