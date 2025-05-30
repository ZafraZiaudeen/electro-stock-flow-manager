import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet } from "react-router";

const AdminProtectedLayout = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return null; 
  }

  if (!user || user.publicMetadata.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedLayout;