import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hub } from './components/Hub';
import { ErrorBoundary } from './components/ErrorBoundary';
import { createPath, legacyHashToPath, parsePath, type RouteState, type ViewState } from './routing';
import { setPageMetadata } from './utils/seo';
import './App.css';

const Catalog = lazy(() => import('./components/Catalog').then(module => ({ default: module.Catalog })));
const StoneDetail = lazy(() => import('./components/StoneDetail').then(module => ({ default: module.StoneDetail })));
const Services = lazy(() => import('./components/Services').then(module => ({ default: module.Services })));

const PAGE_METADATA: Record<Exclude<ViewState, 'detail'>, { title: string; description: string }> = {
  hub: {
    title: 'ATLAS STONE | Натуральный камень и изделия на заказ',
    description: 'Натуральный камень, изготовление изделий по индивидуальным размерам и профессиональный монтаж.',
  },
  catalog: {
    title: 'Каталог натурального камня | ATLAS STONE',
    description: 'Каталог мрамора, гранита, кварцита, оникса, травертина и лабрадорита с фильтрами по цвету и происхождению.',
  },
  services: {
    title: 'Изготовление и монтаж изделий из камня | ATLAS STONE',
    description: 'Изготовление столешниц, лестниц, каминов и панно из натурального камня, обработка, доставка и монтаж.',
  },
};

const readInitialRoute = (): RouteState => {
  const legacyPath = legacyHashToPath(window.location.hash);
  if (legacyPath) {
    window.history.replaceState(null, '', legacyPath);
  }
  return parsePath(window.location.pathname);
};

function App() {
  const [route, setRoute] = useState<RouteState>(readInitialRoute);

  const syncRoute = useCallback(() => {
    const nextRoute = parsePath(window.location.pathname);
    setRoute(nextRoute);
    if (nextRoute.view !== 'catalog') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const migratedPath = legacyHashToPath(window.location.hash);
      if (!migratedPath) return;
      window.history.replaceState(null, '', migratedPath);
      syncRoute();
    };

    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [syncRoute]);

  useEffect(() => {
    if (route.view === 'detail') {
      setPageMetadata({
        title: 'Материал из натурального камня | ATLAS STONE',
        description: 'Характеристики, наличие и расчет изделия из выбранного натурального камня.',
        path: createPath(route.view, route.stoneId),
      });
      return;
    }

    setPageMetadata({ ...PAGE_METADATA[route.view], path: createPath(route.view) });
  }, [route]);

  const handleNavigate = useCallback((newView: ViewState, stoneId: string | null = null) => {
    const nextPath = createPath(newView, stoneId);

    if (window.location.pathname === nextPath) {
      setRoute({ view: newView, stoneId });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.history.pushState(null, '', nextPath);
    setRoute({ view: newView, stoneId });
    if (newView !== 'catalog') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const renderContent = () => {
    switch (route.view) {
      case 'hub':
        return <Hub setView={handleNavigate} />;
      case 'catalog':
        return <Catalog setView={handleNavigate} />;
      case 'detail':
        return route.stoneId ? (
          <StoneDetail key={route.stoneId} stoneId={route.stoneId} setView={handleNavigate} />
        ) : (
          <Catalog setView={handleNavigate} />
        );
      case 'services':
        return <Services />;
      default:
        return <Hub setView={handleNavigate} />;
    }
  };

  return (
    <>
      <Navbar currentView={route.view} setView={handleNavigate} />
      <main className="main-content">
        <ErrorBoundary key={`${route.view}:${route.stoneId ?? ''}`}>
          <Suspense fallback={<div className="route-loading" role="status">Загружаем страницу…</div>}>
            {renderContent()}
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer setView={handleNavigate} />
    </>
  );
}

export default App;
