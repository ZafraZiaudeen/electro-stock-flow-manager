import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import { ClerkProvider } from "@clerk/clerk-react";

import RootLayout from "./layouts/root.layout";
import Dashboard from "./pages/dashboard.page";
import MainLayout from "./layouts/main.layout";
import PurchaseEntry from "./pages/purchase-entry.page";
import OpeningStockEntry from "./pages/inventory/opening-stock.page";
import ProtectedLayout from "./layouts/protected.layout";
import AdminProtectedLayout from "./layouts/admin-protected.layout";
import SignInPage from "./pages/sign-in.page";
import SignUpPage from "./pages/sign-up.page";
import GRNManagement from "./pages/grn-management.page";
import Return from "./pages/return.page";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to .env file");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <Routes>
          <Route element={<RootLayout />}>
            <Route element={<MainLayout />}>
              <Route element={<ProtectedLayout />}>
                <Route element={<AdminProtectedLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/purchase-entry" element={<PurchaseEntry />} />
                  <Route path="/inventory/opening-stock" element={<OpeningStockEntry />} />
                  <Route path="/grn-management" element={<GRNManagement />} />
                  <Route path="/returns" element={<Return />} />
                </Route>
              </Route>
            </Route>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
);