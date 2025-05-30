import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";

import RootLayout from './layouts/root.layout';
import Dashboard from './pages/dashboard.page';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Dashboard />} />
         
       
        </Route>
      </Routes>
    </BrowserRouter>
  

  </StrictMode>
)
