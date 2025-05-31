import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedLayout = () => {
  const { isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    // Redirect to sign-in, preserving the intended route
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;