import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Package } from "lucide-react";

const AdminProtectedLayout = () => {
  const { user } = useUser();
  const location = useLocation();

  // Parent ProtectedLayout already handles isLoaded and authentication checks
  // Check if user has admin role
  const userRole = user?.publicMetadata?.role;
  
  if (userRole === "admin") {
    return <Outlet />;
  }

  // Non-admin users are redirected to dashboard
  return <Navigate to="/dashboard" state={{ from: location.pathname, error: "admin_only" }} replace />;
};

export default AdminProtectedLayout;