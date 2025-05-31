import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import SignInPage from "./sign-in.page";
import { Package } from "lucide-react";

export default function HomePage() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-blue-600 text-white animate-pulse">
              <Package className="size-6" />
            </div>
            <div className="absolute inset-0 rounded-lg bg-blue-600/30 animate-ping" />
          </div>
          <div className="grid text-center text-sm leading-tight">
            <span className="truncate font-semibold text-gray-800">Inventory Pro</span>
          </div>
        </div>
      </div>
    );
  }

  // Redirect admins to dashboard
  if (isSignedIn && user?.publicMetadata.role === "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <SignInPage />;
}