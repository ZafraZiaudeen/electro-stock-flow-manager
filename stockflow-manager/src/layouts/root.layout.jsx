import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Package } from "lucide-react";

const pageTitles = {
  "/": "Home",
  "/sign-in": "Sign-In",
  "/sign-up": "Sign-Up",
  "/dashboard": "Dashboard",
  "/purchase-entry": "Purchase Entry",
  "/inventory/opening-stock": "Opening Stock",
  "/grn-management": "GRN Management",
  "/returns": "Returns",
  "/projects": "Projects Management",
  "/user-management": "User Management",
  "/projects": "Projects Management",  
  "/issue-item": "Issue Management",
  "/inventory/all-items": "All Items",
};

export default function RootLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const { isLoaded } = useUser();

  const pageTitle = pageTitles[pathname] || "Inventory Pro";

  useEffect(() => {
    if (isLoaded) {
      document.title = pageTitle;
    }
  }, [pageTitle, isLoaded]);

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

  return <Outlet />;
}