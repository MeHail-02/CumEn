import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hub } from './components/Hub';
import { Catalog } from './components/Catalog';
import { StoneDetail } from './components/StoneDetail';
import { Services } from './components/Services';
import './App.css';

type ViewState = 'hub' | 'catalog' | 'detail' | 'services';

interface RouteState {
  view: ViewState;
  stoneId: string | null;
}

const readRoute = (): RouteState => {
  const route = window.location.hash.slice(1);

  if (route === '/catalog') return { view: 'catalog', stoneId: null };
  if (route === '/services') return { view: 'services', stoneId: null };
  if (route.startsWith('/stone/')) {
    try {
      const stoneId = decodeURIComponent(route.slice('/stone/'.length));
      if (stoneId) return { view: 'detail', stoneId };
    } catch {
      // A malformed hash falls back to the home page.
    }
  }

  return { view: 'hub', stoneId: null };
};

const createHash = (view: ViewState, stoneId: string | null) => {
  if (view === 'catalog') return '#/catalog';
  if (view === 'services') return '#/services';
  if (view === 'detail' && stoneId) return `#/stone/${encodeURIComponent(stoneId)}`;
  return '#/';
};

function App() {
  const initialRoute = readRoute();
  const [view, setView] = useState<ViewState>(initialRoute.view);
  const [selectedStoneId, setSelectedStoneId] = useState<string | null>(initialRoute.stoneId);

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/');
    }

    const syncRoute = () => {
      const route = readRoute();
      setView(route.view);
      setSelectedStoneId(route.stoneId);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const handleNavigate = (newView: ViewState, stoneId: string | null = null) => {
    const nextHash = createHash(newView, stoneId);

    if (window.location.hash === nextHash) {
      setView(newView);
      setSelectedStoneId(stoneId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.location.hash = nextHash;
  };

  const renderContent = () => {
    switch (view) {
      case 'hub':
        return <Hub setView={handleNavigate} />;
      case 'catalog':
        return <Catalog setView={handleNavigate} />;
      case 'detail':
        return selectedStoneId ? (
          <StoneDetail key={selectedStoneId} stoneId={selectedStoneId} setView={handleNavigate} />
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
      <Navbar currentView={view} setView={handleNavigate} />
      <main className="main-content">
        {renderContent()}
      </main>
      <Footer setView={handleNavigate} />
    </>
  );
}

export default App;
