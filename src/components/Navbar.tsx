import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setView: (view: 'hub' | 'catalog' | 'detail' | 'services', stoneId?: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (view: 'hub' | 'catalog' | 'services') => {
    setView(view, null);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo" onClick={() => handleNavClick('hub')}>
          <span className="logo-title">AURA</span>
          <span className="logo-subtitle">STONE</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <button 
            className={`nav-link ${currentView === 'hub' ? 'active' : ''}`}
            onClick={() => handleNavClick('hub')}
          >
            Главная
          </button>
          <button 
            className={`nav-link ${currentView === 'catalog' || currentView === 'detail' ? 'active' : ''}`}
            onClick={() => handleNavClick('catalog')}
          >
            Каталог камня
          </button>
          <button 
            className={`nav-link ${currentView === 'services' ? 'active' : ''}`}
            onClick={() => handleNavClick('services')}
          >
            Услуги & Производство
          </button>
        </nav>

        {/* Contact info / Action */}
        <div className="nav-contact">
          <a href="tel:+74950000000" className="phone-link">
            <Phone size={16} className="phone-icon" />
            <span>+7 (495) 000-00-00</span>
          </a>
          <button 
            className="btn-callback"
            onClick={() => {
              const formSection = document.getElementById('callback-form');
              if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                // If not on a page with form, redirect to services where the form is
                setView('services');
                setTimeout(() => {
                  document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          >
            Консультация
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-links">
          <button 
            className={`mobile-nav-link ${currentView === 'hub' ? 'active' : ''}`}
            onClick={() => handleNavClick('hub')}
          >
            Главная
          </button>
          <button 
            className={`mobile-nav-link ${currentView === 'catalog' || currentView === 'detail' ? 'active' : ''}`}
            onClick={() => handleNavClick('catalog')}
          >
            Каталог камня
          </button>
          <button 
            className={`mobile-nav-link ${currentView === 'services' ? 'active' : ''}`}
            onClick={() => handleNavClick('services')}
          >
            Услуги & Производство
          </button>
          
          <div className="mobile-drawer-footer">
            <a href="tel:+74950000000" className="mobile-phone">
              +7 (495) 000-00-00
            </a>
            <p className="mobile-hours">Ежедневно: 09:00 — 21:00</p>
            <p className="mobile-address">Москва, Кутузовский проспект, 12</p>
          </div>
        </nav>
      </div>

      {/* Custom Styles for Navbar */}
      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          background-color: rgba(15, 16, 18, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: var(--transition-smooth);
        }
        
        .navbar-scrolled {
          background-color: rgba(15, 16, 18, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }

        .navbar-container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 20px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: var(--transition-smooth);
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 15px 20px;
          }
        }

        .logo {
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .logo-title {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          letter-spacing: 0.15em;
          line-height: 1;
          font-weight: 400;
          color: #ffffff;
        }

        .logo-subtitle {
          font-size: 0.6rem;
          letter-spacing: 0.55em;
          text-indent: 0.15em;
          color: var(--color-accent-gold);
          margin-top: 2px;
          font-weight: 500;
        }

        .nav-desktop {
          display: flex;
          gap: 40px;
        }

        @media (max-width: 1024px) {
          .nav-desktop {
            display: none;
          }
        }

        .nav-link {
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          transition: var(--transition-fast);
          padding: 8px 0;
          position: relative;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: var(--color-accent-gold);
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.3s ease;
        }

        .nav-link:hover {
          color: #ffffff;
        }

        .nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .nav-link.active {
          color: var(--color-accent-gold);
        }

        .nav-link.active::after {
          transform: scaleX(1);
          background-color: var(--color-accent-gold);
        }

        .nav-contact {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        @media (max-width: 768px) {
          .nav-contact {
            display: none;
          }
        }

        .phone-link {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          letter-spacing: 0.05em;
        }

        .phone-link:hover {
          color: var(--color-accent-gold);
        }

        .phone-icon {
          color: var(--color-accent-gold);
        }

        .btn-callback {
          padding: 8px 18px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: var(--transition-smooth);
        }

        .btn-callback:hover {
          border-color: var(--color-accent-gold);
          color: var(--color-accent-gold);
          box-shadow: 0 0 15px rgba(197, 168, 128, 0.15);
        }

        .mobile-menu-btn {
          display: none;
          color: #ffffff;
        }

        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: block;
            z-index: 1001;
          }
        }

        /* Mobile Drawer */
        .mobile-drawer {
          position: fixed;
          top: 0;
          right: -100%;
          width: 80%;
          max-width: 400px;
          height: 100vh;
          background-color: var(--color-bg-dark);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          z-index: 999;
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          padding: 120px 40px 40px;
          display: flex;
          flex-direction: column;
        }

        .mobile-drawer.open {
          transform: translateX(-125%); /* Shift left into screen */
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 30px;
          height: 100%;
        }

        .mobile-nav-link {
          font-size: 1.1rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.8);
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 12px;
          transition: var(--transition-fast);
        }

        .mobile-nav-link:hover, .mobile-nav-link.active {
          color: var(--color-accent-gold);
          border-bottom-color: var(--color-accent-gold);
        }

        .mobile-drawer-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mobile-phone {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--color-accent-gold);
          margin-bottom: 10px;
        }

        .mobile-hours {
          font-size: 0.8rem;
          color: var(--color-text-dark-muted);
        }

        .mobile-address {
          font-size: 0.8rem;
          color: var(--color-text-dark-muted);
          line-height: 1.4;
        }
      `}</style>
    </header>
  );
};
