import { Outlet } from "react-router";
import { useLocation } from "react-router";
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react"; 

const pageTitles = {
  "/": "Dashboard",
  "/purchase-entry": "Purchase Entry",
  "/inventory/opening-stock": "Opening Stock",
};

export default function RootLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const { isLoaded } = useUser(); // Get loading state from Clerk

  const pageTitle = pageTitles[pathname] || "Inventory Pro";

  useEffect(() => {
    if (isLoaded) {
      document.title = pageTitle;
    }
  }, [pageTitle, isLoaded]);

  // Show a loading state until Clerk's user data is loaded
  if (!isLoaded) {
    return null; // Or you can return a loading spinner: <div>Loading...</div>
  }

  return <Outlet />;
}