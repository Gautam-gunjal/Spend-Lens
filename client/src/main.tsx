import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuditForm from './pages/AuditForm'
import AuditResults from './pages/AuditResults'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuditForm />} />
        <Route path="/results/:id" element={<AuditResults />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
