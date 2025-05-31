import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Package } from "lucide-react";

const WarehouseStaffProtectedLayout = () => {
  const { user, isLoaded } = useUser();
  const location = useLocation();

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

  if (user && (user.publicMetadata.role === "warehouse_staff" || user.publicMetadata.role === "admin")) {
    return <Outlet />;
  }

  return <Navigate to="/" state={{ from: location.pathname }} replace />;
};

export default WarehouseStaffProtectedLayout;