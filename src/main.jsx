import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Corrected import
import { ClerkProvider } from "@clerk/clerk-react";

import RootLayout from "./layouts/root.layout";
import Dashboard from "./pages/dashboard.page";
import MainLayout from "./layouts/main.layout";
import PurchaseEntry from "./pages/purchase-entry.page";
import OpeningStockEntry from "./pages/inventory/opening-stock.page";
import AdminProtectedLayout from "./layouts/admin-protected.layout";
import SignInPage from "./pages/sign-in.page";
import SignUpPage from "./pages/sign-up.page";
import GRNManagement from "./pages/grn-management.page";
import Return from "./pages/return.page";
import ProjectsManagement from "./pages/project-management.page";
import IssueItems from "./pages/issue-item.page";
import HomePage from "./pages/home.page";
import UserManagement from "./pages/user-management.page";
import Inventory from "./pages/inventory/all-items.page";
import { store } from "./lib/store"; // Ensure path is correct
import { Provider } from "react-redux";

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
              <Route element={<AdminProtectedLayout />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/purchase-entry" element={<PurchaseEntry />} />
                  <Route path="/inventory/opening-stock" element={<OpeningStockEntry />} />
                  <Route path="/grn-management" element={<GRNManagement />} />
                  <Route path="/returns" element={<Return />} />
                  <Route path="/projects" element={<ProjectsManagement />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/issue-item" element={<IssueItems />} />
                  <Route path="/inventory/all-items" element={<Inventory />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ClerkProvider>
    </Provider>
  </StrictMode>
);