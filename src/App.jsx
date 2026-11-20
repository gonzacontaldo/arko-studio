import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

const HomePage = lazy(() => import('./pages/HomePage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const EjemploPage = lazy(() => import('./pages/EjemploPage'));
const ServicePage = lazy(() => import('./pages/ServicePage'));
const PhotographyPage = lazy(() => import('./pages/PhotographyPage'));
const VideoPage = lazy(() => import('./pages/VideoPage'));
const PlansPage = lazy(() => import('./pages/PlansPage'));
const ToursPage = lazy(() => import('./pages/ToursPage'));
const AerialPage = lazy(() => import('./pages/AerialPage'));
const ReservationModal = lazy(() => import('./components/ReservationModal'));
const QuotePage = lazy(() => import('./pages/QuotePage'));

function HashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash.startsWith('#reserva=')) return undefined;
    if (!hash) {
      if (pathname === '/') window.scrollTo(0, 0);
      return undefined;
    }

    const id = decodeURIComponent(hash.slice(1));
    const scroll = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    };

    if (scroll()) return undefined;
    const observer = new MutationObserver(() => {
      if (scroll()) observer.disconnect();
    });
    observer.observe(document.getElementById('root'), { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 3000);
    return () => { observer.disconnect(); window.clearTimeout(timeout); };
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <>
      <HashScroll />
      <Suspense fallback={<div className="min-h-screen bg-surface" aria-label="Cargando" />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/fotografia-inmobiliaria" element={<PhotographyPage />} />
          <Route path="/video-inmobiliario" element={<VideoPage />} />
          <Route path="/planos-2d" element={<PlansPage />} />
          <Route path="/tour-virtual-360" element={<ToursPage />} />
          <Route path="/drone-inmobiliario" element={<AerialPage />} />
          <Route path="/:serviceSlug" element={<ServicePage />} />
          <Route path="/ejemplo" element={<EjemploPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/presupuesto" element={<QuotePage />} />
        </Routes>
        <ReservationModal />
      </Suspense>
      <SpeedInsights />
    </>
  );
}
