
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="bg-blue-600 text-white py-20 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">믿을 수 있는 A/S 플랫폼, Re:Pair</h1>
      <p className="text-lg md:text-xl mb-8">수리 요청부터 완료까지, 투명하게 비교하고 쉽고 빠르게 처리하세요.</p>
      <div className="space-x-4">
        <Link
          to="/login"
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100"
        >
          로그인
        </Link>
        <Link
          to="/signup"
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100"
        >
          회원가입
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;