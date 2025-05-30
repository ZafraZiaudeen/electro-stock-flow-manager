import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";

import LoginPage from './pages/login.page';
import RootLayout from './layouts/root.layout';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          
          <Route path="/sign-in" element={<LoginPage />} />
       
        </Route>
      </Routes>
    </BrowserRouter>
  

  </StrictMode>
)
