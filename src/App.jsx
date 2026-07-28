import { Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import AdminPage from './pages/AdminPage';
import EjemploPage from './pages/EjemploPage';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/ejemplo" element={<EjemploPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <SpeedInsights />
    </>
  );
}
