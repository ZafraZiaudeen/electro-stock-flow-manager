import { Outlet } from "react-router";
import { useLocation } from "react-router";
import { useEffect } from "react";

// Map routes to page titles
const pageTitles = {
  "/": "Dashboard",
};

export default function RootLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  // Get the page title based on the current route
  const pageTitle = pageTitles[pathname] || "Inventory Pro";

  // Update document title
  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return <Outlet />;
}