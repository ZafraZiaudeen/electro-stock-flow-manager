import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import SignInPage from "./sign-in.page";

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Redirect admins to dashboard
  if (isSignedIn && user?.publicMetadata.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Show sign-in page for unauthenticated users
  return <SignInPage />;
}