import { Link } from "react-router-dom";
import bannerBg from "../../assets/partner-banner.jpg";

const LandingPartnerBanner = () => {
  return (
    <section
      className="relative bg-cover bg-center text-white py-40 px-6 min-h-[700px]"
      style={{ backgroundImage: `url(${bannerBg})` }}
    >
      <div className="bg-black/30 absolute inset-0 z-0" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <h3 className="text-2xl md:text-3xl font-semibold mb-4">고객사이신가요?</h3>
        <p className="mb-6 text-sm">더 많은 고객을 만나보세요</p>
        <Link
          to="/register-partner"
          className="border border-white rounded-full px-6 py-2 text-sm hover:bg-white hover:text-green-700 transition"
        >
          입점신청
        </Link>
      </div>
    </section>
  );
};

export default LandingPartnerBanner;
