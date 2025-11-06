import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn, user } = useUser();
  const location = useLocation();
  const userRole = user?.publicMetadata?.role;

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  const restrictedPaths = [
    '/purchase-entry',
    '/grn-management',
    '/issue-item',
    '/returns',
    '/projects',
    '/inventory',
    '/user-management'
  ];

  if (
    userRole === 'viewer' &&
    restrictedPaths.some(path => location.pathname.startsWith(path)) &&
    location.pathname !== "/request-warehouse"
  ) {
    console.log('Redirecting viewer to viewer-dashboard');
    return <Navigate to="/request-warehouse"/>;
  }

  return <Outlet />;
}