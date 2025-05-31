import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AdminProtectedLayout = () => {
  const { user, isLoaded } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Allow access if user is an admin
  if (user && user.publicMetadata.role === "admin") {
    return <Outlet />;
  }

  // Redirect non-admins to the home page, preserving the intended route as state
  return <Navigate to="/" state={{ from: location.pathname }} replace />;
};

export default AdminProtectedLayout;