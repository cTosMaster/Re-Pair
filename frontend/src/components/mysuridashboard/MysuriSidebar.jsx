const MysuriSidebar = ({ selectedMenu, setSelectedMenu }) => {
  const menus = [
    "수리 요청 관리", //RequestList + RequestCard
    "수리 현황 관리", //RequestManage
    "수리 기사 관리",
    "수리 물품 관리",
    "요금 정책(프리셋)",
    "결제 관리",
    "통계시스템",
  ];

  return (
    <aside
      className="p-10 bg-white rounded-xl shadow-md"
      style={{ width: "308px", height: "810px" }}
    >
      <nav>
        <ul className="space-y-2">
          {menus.map((menu) => {
            const isActive = selectedMenu === menu;

            return (
              <li
                key={menu}
                onClick={() => setSelectedMenu(menu)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition 
                  ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                {/* 왼쪽 컬러 인디케이터 */}
                <div className={`w-1.5 h-5 rounded-full ${isActive ? 'bg-blue-600' : ''}`} />
                <span>{menu}</span>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default MysuriSidebar;