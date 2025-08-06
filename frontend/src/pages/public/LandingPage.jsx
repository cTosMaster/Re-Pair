import PublicHeader from "../../components/landing/PublicHeader";
import LandingHero from "../../components/landing/LandingHero";
import LandingProductBanner from "../../components/landing/LandingProductBanner";
import LandingPartnerBanner from "../../components/landing/LandingPartnerBanner";
import PublicFooter from "../../components/landing/PublicFooter";

const LandingPage = () => {
  return (
    <div className="bg-white text-gray-800">
      <PublicHeader />
      <LandingHero />
      <LandingProductBanner />
      <LandingPartnerBanner />
      <PublicFooter />
    </div>
  );
};

export default LandingPage;
