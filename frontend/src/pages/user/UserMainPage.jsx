import HeroSection from "../../components/main/HeroSection";
import StepGuide from "../../components/main/StepGuide";
import PartnerSection from "../../components/main/PartnerSection";
import ReviewSection from "../../components/main/ReviewSection";
import Footer from "../../layouts/Footer";
import Header from "../../layouts/Header";

const UserMainPage = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <StepGuide />
      <PartnerSection />
      <ReviewSection />
      <Footer />
    </>
  );
};

export default UserMainPage;