import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

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
  "/issue-item": "Issue Management",
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
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <Outlet />;
}