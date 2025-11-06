import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Package } from "lucide-react";

const WarehouseStaffProtectedLayout = () => {
  const { user } = useUser();
  const location = useLocation();

  // Parent ProtectedLayout already handles isLoaded and authentication checks
  // Check if user has warehouse_staff or admin role
  const userRole = user?.publicMetadata?.role;
  
  if (userRole === "warehouse_staff" || userRole === "admin") {
    return <Outlet />;
  }

  // Viewers and other users are redirected to dashboard
  return <Navigate to="/dashboard" state={{ from: location.pathname, error: "warehouse_access_only" }} replace />;
};

export default WarehouseStaffProtectedLayout;