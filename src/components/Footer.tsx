import React from 'react';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

interface FooterProps {
  setView: (view: 'hub' | 'catalog' | 'detail' | 'services', stoneId?: string | null) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  const handleNavClick = (view: 'hub' | 'catalog' | 'services') => {
    setView(view, null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalculationClick = () => {
    const calculator = document.getElementById('callback-form');
    if (calculator) {
      calculator.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setView('services', null);
    setTimeout(() => {
      document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="footer">
      <div className="container footer-grid">
        {/* Brand Info */}
        <div className="footer-col brand-col">
          <div className="footer-logo" onClick={() => handleNavClick('hub')}>
            <span className="logo-title">AURA</span>
            <span className="logo-subtitle">STONE</span>
          </div>
          <p className="brand-desc">
            Галерея природного камня и высокотехнологичное производство изделий. Мы создаем шедевры из мрамора, гранита и кварцита для эксклюзивных интерьеров.
          </p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-link" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="footer-col">
          <h3 className="footer-title">Разделы</h3>
          <ul className="footer-links">
            <li><button onClick={() => handleNavClick('hub')}>Главная хаб</button></li>
            <li><button onClick={() => handleNavClick('catalog')}>Каталог камня</button></li>
            <li><button onClick={() => handleNavClick('services')}>Услуги и производство</button></li>
            <li><button onClick={handleCalculationClick}>Рассчитать стоимость</button></li>
          </ul>
        </div>

        {/* Contacts */}
        <div className="footer-col">
          <h3 className="footer-title">Контакты</h3>
          <ul className="contact-list">
            <li>
              <Phone size={14} className="contact-icon" />
              <a href="tel:+74950000000">+7 (495) 000-00-00</a>
            </li>
            <li>
              <Mail size={14} className="contact-icon" />
              <a href="mailto:info@aurastone.ru">info@aurastone.ru</a>
            </li>
            <li>
              <MapPin size={14} className="contact-icon" />
              <span>Москва, Кутузовский проспект, 12</span>
            </li>
            <li>
              <Clock size={14} className="contact-icon" />
              <span>Пн-Вс: 09:00 — 21:00</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-col news-col">
          <h3 className="footer-title">Индивидуальный подбор</h3>
          <p className="news-desc">
            Оставьте свой email, чтобы получить эксклюзивный PDF-каталог новых поступлений редких сортов мрамора и кварцита.
          </p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Спасибо за подписку! Каталог отправлен на ваш email.'); }}>
            <input 
              type="email" 
              placeholder="Ваш E-mail" 
              className="news-input" 
              required 
            />
            <button type="submit" className="news-submit">Получить</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-flex">
          <p className="copyright">&copy; {new Date().getFullYear()} AURA STONE. Все права защищены.</p>
          <div className="legal-links">
            <a href="#" onClick={(e) => e.preventDefault()}>Политика конфиденциальности</a>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Согласие на обработку персональных данных</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background-color: #0b0c0d;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 80px 0 30px;
          margin-top: auto;
          color: rgba(255, 255, 255, 0.8);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 2fr;
          gap: 40px;
          margin-bottom: 60px;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .footer-logo {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          align-self: flex-start;
        }

        .brand-desc {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--color-text-dark-muted);
        }

        .social-links {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .social-icon-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.6);
          transition: var(--transition-fast);
        }

        .social-icon-link:hover {
          border-color: var(--color-accent-gold);
          color: var(--color-accent-gold);
          box-shadow: 0 0 10px rgba(197, 168, 128, 0.15);
        }

        .footer-title {
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #ffffff;
          position: relative;
          padding-bottom: 8px;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30px;
          height: 1px;
          background-color: var(--color-accent-gold);
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links button {
          text-align: left;
          font-size: 0.85rem;
          color: var(--color-text-dark-muted);
          transition: var(--transition-fast);
        }

        .footer-links button:hover, .footer-links a:hover {
          color: var(--color-accent-gold);
          padding-left: 5px;
        }

        .footer-links a {
          font-size: 0.85rem;
          color: var(--color-text-dark-muted);
          transition: var(--transition-fast);
          display: block;
        }

        .contact-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 15px;
          font-size: 0.85rem;
        }

        .contact-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--color-text-dark-muted);
        }

        .contact-icon {
          color: var(--color-accent-gold);
          flex-shrink: 0;
        }

        .contact-list a {
          color: var(--color-text-dark-muted);
        }

        .contact-list a:hover {
          color: var(--color-accent-gold);
        }

        .news-desc {
          font-size: 0.85rem;
          color: var(--color-text-dark-muted);
          line-height: 1.5;
        }

        .newsletter-form {
          display: flex;
          width: 100%;
        }

        .news-input {
          flex-grow: 1;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-right: none;
          padding: 12px 16px;
          color: #ffffff;
          font-size: 0.85rem;
          font-family: var(--font-sans);
          outline: none;
          transition: var(--transition-fast);
        }

        .news-input:focus {
          border-color: var(--color-accent-gold);
          background: rgba(255, 255, 255, 0.05);
        }

        .news-submit {
          background-color: var(--color-accent-gold);
          color: #121212;
          border: 1px solid var(--color-accent-gold);
          padding: 0 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: var(--transition-fast);
        }

        .news-submit:hover {
          background-color: transparent;
          color: var(--color-accent-gold);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 30px;
          font-size: 0.75rem;
          color: var(--color-text-dark-muted);
        }

        .footer-bottom-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        @media (max-width: 768px) {
          .footer-bottom-flex {
            flex-direction: column;
            text-align: center;
          }
        }

        .legal-links {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .legal-links a {
          color: var(--color-text-dark-muted);
        }

        .legal-links a:hover {
          color: var(--color-accent-gold);
        }

        .divider {
          color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </footer>
  );
};
