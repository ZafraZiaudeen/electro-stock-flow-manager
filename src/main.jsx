import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { Provider } from "react-redux";
import { store } from "./lib/store";

import RootLayout from "./layouts/root.layout";
import ProtectedLayout from "./layouts/protected.layout";
import AdminProtectedLayout from "./layouts/admin-protected.layout";
import WarehouseStaffProtectedLayout from "./layouts/warehouse-staff-protected.layout";
import MainLayout from "./layouts/main.layout";

import HomePage from "./pages/home.page";
import SignInPage from "./pages/sign-in.page";
import SignUpPage from "./pages/sign-up.page";
import Dashboard from "./pages/dashboard.page";
import PurchaseEntry from "./pages/purchase-entry.page";
import OpeningStockEntry from "./pages/inventory/opening-stock.page";
import GRNManagement from "./pages/grn-management.page";
import Return from "./pages/return.page";
import ProjectsManagement from "./pages/project-management.page";
import IssueItems from "./pages/issue-item.page";
import UserManagement from "./pages/user-management.page";
import Inventory from "./pages/inventory/all-items.page";
import ViewerDashboard from "./pages/viewer-dashboard.page";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to .env file");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/sign-up" element={<SignUpPage />} />
              
            
              {/* Protected Routes - All authenticated users */}
              <Route element={<ProtectedLayout />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  {/* <Route path="/request-warehouse" element={<ViewerDashboard />} /> */}
                  
                  {/* Warehouse Staff & Admin Routes - operational features */}
                  <Route element={<WarehouseStaffProtectedLayout />}>
                    <Route path="/purchase-entry" element={<PurchaseEntry />} />
                    <Route path="/grn-management" element={<GRNManagement />} />
                    <Route path="/issue-item" element={<IssueItems />} />
                    <Route path="/returns" element={<Return />} />
                    <Route path="/projects" element={<ProjectsManagement />} />
                    <Route path="/inventory/opening-stock" element={<OpeningStockEntry />} />
                    <Route path="/inventory/all-items" element={<Inventory />} />
                  </Route>
                  
                  {/* Admin Only Routes */}
                  <Route element={<AdminProtectedLayout />}>
                    <Route path="/user-management" element={<UserManagement />} />
                  </Route>
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ClerkProvider>
    </Provider>
  </StrictMode>
);