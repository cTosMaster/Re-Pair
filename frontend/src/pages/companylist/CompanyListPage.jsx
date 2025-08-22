import PublicHeader from "../../components/landing/PublicHeader";
import CompanyListSection from "./CompanyListSection";

const CompanyListPage = () => {
  return (
    <div className="bg-white text-gray-800 min-h-screen flex flex-col">
      {/* 상단 */}
      <PublicHeader />

      {/* 중단 */}
      <main className="flex-1 px-6 pt-6">
        <CompanyListSection />
      </main>

      {/* 하단 */}
    </div>
  );
};

export default CompanyListPage;