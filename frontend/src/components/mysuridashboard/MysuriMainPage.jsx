import { useState } from 'react';
import Header from '../../layouts/Header';
import MysuriSidebar from './MysuriSidebar';
import MysuriRequestList from './MysuriRequestList';
import Surigisamanage from './Surigisamanage';
import RepairgoodsManagement from './RepairgoodsManagement';
import CategoryManagement from './CategoryManagement'
import PresetList from './PresetList';
import MysuriCurrentList from './MysuriCurrentList';


const MysuriMainPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("수리 요청 목록");

  // 콘텐츠 변경 로직
  const renderContent = () => {
    switch (selectedMenu) {
      case "수리 요청 관리":
        return <MysuriRequestList />;
      case "수리 현황 관리":
        return <MysuriCurrentList/>;
      case "수리 기사 관리":
        return <Surigisamanage />;
      case "수리 카테고리 관리":
        return <CategoryManagement />;
      case "수리 물품 관리":
        return <RepairgoodsManagement />;
      case "요금 정책(프리셋)":
        return <PresetList />;
      case "결제 관리":
        return <div>결제 관리 내용</div>;
      case "통계시스템":
        return <div>통계시스템 내용</div>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* 헤더 높이만큼 패딩 */}
      <div className="pt-[80px]">
        {/* 본문 레이아웃 */}
        <div className="mx-auto max-w-screen-2xl px-6 flex items-start gap-6">
          {/* 사이드바: 고정너비 + sticky */}
          <aside className="w-72 shrink-0 sticky top-[80px] py-4">
            <MysuriSidebar
              selectedMenu={selectedMenu}
              setSelectedMenu={setSelectedMenu}
            />
          </aside>

          {/* 본문 */}
          <main className="flex-1 min-h-[calc(100vh-80px)] bg-white rounded-xl shadow-sm p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MysuriMainPage;
