import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hub } from './components/Hub';
import { Catalog } from './components/Catalog';
import { StoneDetail } from './components/StoneDetail';
import { Services } from './components/Services';
import './App.css';

type ViewState = 'hub' | 'catalog' | 'detail' | 'services';

function App() {
  const [view, setView] = useState<ViewState>('hub');
  const [selectedStoneId, setSelectedStoneId] = useState<string | null>(null);

  const handleNavigate = (newView: ViewState, stoneId: string | null = null) => {
    setView(newView);
    setSelectedStoneId(stoneId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (view) {
      case 'hub':
        return <Hub setView={handleNavigate} />;
      case 'catalog':
        return <Catalog setView={handleNavigate} />;
      case 'detail':
        return selectedStoneId ? (
          <StoneDetail stoneId={selectedStoneId} setView={handleNavigate} />
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
