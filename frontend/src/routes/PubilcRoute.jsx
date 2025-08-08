import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PublicRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    const roleRedirectMap = {
      USER: "/user/main",
      ENGINEER: "/engineer/main",
      CUSTOMER: "/customer/main",
    };
    return <Navigate to={roleRedirectMap[user.role] || "/"} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;