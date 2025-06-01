import { Outlet, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/clerk-react";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/purchase-entry": "Purchase Entry",
  "/inventory/opening-stock": "Opening Stock",
  "/grn-management": "GRN Management",
  "/returns": "Returns",
  "/projects": "Projects Management",
  "/issue-item": "Issue Management",
  "/user-management": "User Management",
};

export default function MainLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, isLoaded } = useUser();

  const pageTitle = pageTitles[pathname] || "Inventory Pro";

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const userName = user?.fullName || user?.firstName || "Admin User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.imageUrl || "/placeholder.svg?height=32&width=32"} alt={userName} />
              <AvatarFallback className="rounded-full bg-blue-100 text-blue-600">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{userName}</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}