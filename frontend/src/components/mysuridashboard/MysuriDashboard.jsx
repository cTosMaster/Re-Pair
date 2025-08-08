
import React from "react";
import Sidebar from "./Sidebar";
import RequestList from "./RequestList";

const MysuriDashboard = () => {
  return (
    <div className="flex">
      <Sidebar activeMenu="수리 요청 목록" />
      <RequestList />
    </div>
  );
};

export default MysuriDashboard;
