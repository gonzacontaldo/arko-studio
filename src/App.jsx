import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

const HomePage = lazy(() => import('./pages/HomePage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const EjemploPage = lazy(() => import('./pages/EjemploPage'));
const ServicePage = lazy(() => import('./pages/ServicePage'));

export default function App() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-surface" aria-label="Cargando" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/:serviceSlug" element={<ServicePage />} />
          <Route path="/ejemplo" element={<EjemploPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Suspense>
      <SpeedInsights />
    </>
  );
}
