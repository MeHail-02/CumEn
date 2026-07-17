import React, { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import type { Navigate, ViewState } from '../routing';
import { useModalDialog } from '../hooks/useModalDialog';
import '../styles/Navbar.css';

interface NavbarProps {
  currentView: ViewState;
  setView: Navigate;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const closeMenu = () => setIsOpen(false);
  const drawerRef = useModalDialog<HTMLDivElement>(isOpen, closeMenu);

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
    <header className={`navbar ${currentView === 'hub' || currentView === 'services' ? 'navbar-over-hero' : ''} ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <button type="button" className="logo" onClick={() => handleNavClick('hub')} aria-label="ATLAS STONE — на главную">
          <span className="logo-title">ATLAS</span>
          <span className="logo-subtitle">STONE</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="nav-desktop">
          <button 
            type="button"
            className={`nav-link ${currentView === 'hub' ? 'active' : ''}`}
            onClick={() => handleNavClick('hub')}
          >
            Главная
          </button>
          <button 
            type="button"
            className={`nav-link ${currentView === 'catalog' || currentView === 'detail' ? 'active' : ''}`}
            onClick={() => handleNavClick('catalog')}
          >
            Каталог камня
          </button>
          <button 
            type="button"
            className={`nav-link ${currentView === 'services' ? 'active' : ''}`}
            onClick={() => handleNavClick('services')}
          >
            Услуги по монтажу
          </button>
        </nav>

        {/* Contact info / Action */}
        <div className="nav-contact">
          <a href="tel:+79166411774" className="phone-link">
            <Phone size={16} className="phone-icon" />
            <span>+7 (916) 641-17-74</span>
          </a>
          <button 
            type="button"
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
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <>
          <button type="button" className="mobile-drawer-overlay" onClick={closeMenu} aria-label="Закрыть меню" />
          <div
            id="mobile-navigation"
            ref={drawerRef}
            className="mobile-drawer open"
            role="dialog"
            aria-modal="true"
            aria-label="Навигация по сайту"
            tabIndex={-1}
          >
            <nav className="mobile-nav-links">
          <button 
            type="button"
            className={`mobile-nav-link ${currentView === 'hub' ? 'active' : ''}`}
            onClick={() => handleNavClick('hub')}
          >
            Главная
          </button>
          <button 
            type="button"
            className={`mobile-nav-link ${currentView === 'catalog' || currentView === 'detail' ? 'active' : ''}`}
            onClick={() => handleNavClick('catalog')}
          >
            Каталог камня
          </button>
          <button 
            type="button"
            className={`mobile-nav-link ${currentView === 'services' ? 'active' : ''}`}
            onClick={() => handleNavClick('services')}
          >
            Услуги по монтажу
          </button>
          
          <div className="mobile-drawer-footer">
            <a href="tel:+79166411774" className="mobile-phone">
              +7 (916) 641-17-74
            </a>
            <p className="mobile-hours">ООО «Атлас Стоун»</p>
            <p className="mobile-address">г. Шумерля, ул. Ломоносова, д. 60</p>
          </div>
            </nav>
          </div>
        </>
      )}

      {/* Custom Styles for Navbar */}
    </header>
  );
};
