import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";

import RootLayout from './layouts/root.layout';
import Dashboard from './pages/dashboard.page';
import MainLayout from './layouts/main.layout';
import PurchaseEntry from './pages/purchase-entry.page';
import OpeningStockEntry from './pages/inventory/opening-stock.page';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
         <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/purchase-entry" element={<PurchaseEntry/>} />
         
          <Route path="/inventory/opening-stock" element={<OpeningStockEntry />} />
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  

  </StrictMode>
)
