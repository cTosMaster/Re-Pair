import React, { useState } from 'react';
import MysuriTopnav from './MysuriTopnav';
import MysuriSidebar from './MysuriSidebar';
import MysuriRequestList from './MysuriRequestList';
import MysuriRequestManage from './MysuriRequestManage';
import Surigisamanage from './Surigisamanage';
import RepairgoodsManagement from './RepairgoodsManagement';
import PresetList from './PresetList';


const MysuriMainPage = () => {
  const [selectedMenu, setSelectedMenu] = useState("수리 요청 목록");

  // 콘텐츠 변경 로직
  const renderContent = () => {
    switch (selectedMenu) {
      case "수리 요청 관리":
        return <MysuriRequestList />;
      case "수리 현황 관리":
        return <MysuriRequestManage />;
      case "수리 기사 관리":
        return <Surigisamanage />;
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
      {/* 상단 네비게이션 고정 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <MysuriTopnav />
      </div>

      {/* 왼쪽 사이드바 */}
      <div className="fixed top-[80px] left-10 z-50">
        <MysuriSidebar selectedMenu={selectedMenu} setSelectedMenu={setSelectedMenu} />
      </div>

      {/* 본문 콘텐츠 */}
      <div className="pt-[64px] ml-[420px] min-h-screen bg-gray-50 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default MysuriMainPage;
