import { useState } from "react";
import {
  Package,
  ShoppingCart,
  ArrowUpRight,
  Truck,
  BarChart3,
  Settings,
  Users,
  FileText,
  ChevronDown,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react"; // Import Clerk hooks

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AppSidebar({ activeItem = "dashboard" }) {
  const { state } = useSidebar();
  const [openSections, setOpenSections] = useState({
    inventory: false,
    reports: false,
  });

  // Use Clerk hooks to get user info and sign-out functionality
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Navigation items
  const mainNavItems = [
    {
      title: "Dashboard",
      icon: BarChart3,
      url: "/",
      key: "dashboard",
    },
    {
      title: "Purchase Entry",
      icon: ShoppingCart,
      url: "/purchase-entry",
      key: "purchase",
      // badge: "New",
    },
     {
      title: "GRN Management",
      icon: ArrowUpRight,
      url: "/grn-management",
      key: "grn-management",
    },
    {
      title: "Issue",
      icon: ArrowUpRight,
      url: "/issue",
      key: "issue",
    },
    {
      title: "Returns",
      icon: Truck,
      url: "/returns",
      key: "returns",
    },
     {
      title: "Projects",
      icon: Truck,
      url: "/projects",
      key: "projects",
    },
    {
      title: "Suppliers",
      icon: Truck,
      url: "/suppliers",
      key: "suppliers",
    },
  ];

  const inventoryItems = [
    {
      title: "All Items",
      url: "/inventory/all",
      key: "inventory-all",
    },
    {
      title: "Low Stock",
      url: "/inventory/low-stock",
      key: "inventory-low-stock",
      badge: "3",
    },
    {
      title: "Categories",
      url: "/inventory/categories",
      key: "inventory-categories",
    },
    {
      title: "Opening Stock",
      url: "/inventory/opening-stock",
      key: "inventory-opening",
    },
  ];

  const reportItems = [
    {
      title: "Stock Report",
      url: "/reports/stock",
      key: "reports-stock",
    },
    {
      title: "Purchase Report",
      url: "/reports/purchase",
      key: "reports-purchase",
    },
    {
      title: "Issue Report",
      url: "/reports/issue",
      key: "reports-issue",
    },
    {
      title: "Project Wise",
      url: "/reports/project",
      key: "reports-project",
    },
  ];

  const managementItems = [
    {
      title: "Users",
      icon: Users,
      url: "/users",
      key: "users",
    },
    {
      title: "Settings",
      icon: Settings,
      url: "/settings",
      key: "settings",
    },
  ];

  // Handle sign-out with Clerk
  const handleSignOut = async () => {
    await signOut();
    // Optionally, redirect after sign-out (handled by ProtectedLayout in your app)
  };

  // Ensure user data is loaded before rendering user info
  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  // Get user display name and email
  const userName = user?.fullName || user?.firstName || "Admin User";
  const userEmail = user?.primaryEmailAddress?.emailAddress || "admin@company.com";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200">
      {/* Sidebar Header */}
      <SidebarHeader className="border-b border-gray-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Package className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Inventory Pro</span>
                <span className="truncate text-xs text-muted-foreground">Integration Business</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeItem === item.key}
                    tooltip={state === "collapsed" ? item.title : undefined}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && state === "expanded" && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Inventory Section */}
        <SidebarGroup>
          <Collapsible
            open={openSections.inventory}
            onOpenChange={() => toggleSection("inventory")}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={state === "collapsed" ? "Inventory" : undefined}>
                  <Package />
                  <span>Inventory</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {inventoryItems.map((item) => (
                    <SidebarMenuSubItem key={item.key}>
                      <SidebarMenuSubButton asChild isActive={activeItem === item.key}>
                        <Link to={item.url}>
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarGroup>

        {/* Reports Section */}
        <SidebarGroup>
          <Collapsible
            open={openSections.reports}
            onOpenChange={() => toggleSection("reports")}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={state === "collapsed" ? "Reports" : undefined}>
                  <FileText />
                  <span>Reports</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {reportItems.map((item) => (
                    <SidebarMenuSubItem key={item.key}>
                      <SidebarMenuSubButton asChild isActive={activeItem === item.key}>
                        <Link to={item.url}>
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeItem === item.key}
                    tooltip={state === "collapsed" ? item.title : undefined}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.imageUrl || "/placeholder.svg?height=32&width=32"} alt={userName} />
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{userName}</span>
                    <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={state === "collapsed" ? "right" : "bottom"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.imageUrl || "/placeholder.svg?height=32&width=32"} alt={userName} />
                      <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{userName}</span>
                      <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}