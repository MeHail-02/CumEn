import React from 'react';
import { Building2, FileText, MapPin, Phone } from 'lucide-react';
import type { Navigate } from '../routing';
import '../styles/Footer.css';

interface FooterProps {
  setView: Navigate;
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
          <button type="button" className="footer-logo" onClick={() => handleNavClick('hub')} aria-label="ATLAS STONE — на главную">
            <span className="logo-title">ATLAS</span>
            <span className="logo-subtitle">STONE</span>
          </button>
          <p className="brand-desc">
            Натуральный камень и изделия по индивидуальным размерам. Подбираем материал под задачу, выполняем обработку и сопровождаем проект до монтажа.
          </p>
        </div>

        {/* Navigation */}
        <div className="footer-col">
          <h3 className="footer-title">Разделы</h3>
          <ul className="footer-links">
            <li><button onClick={() => handleNavClick('hub')}>Главная хаб</button></li>
            <li><button onClick={() => handleNavClick('catalog')}>Каталог камня</button></li>
            <li><button onClick={() => handleNavClick('services')}>Услуги по монтажу</button></li>
            <li><button onClick={handleCalculationClick}>Рассчитать стоимость</button></li>
          </ul>
        </div>

        {/* Contacts */}
        <div className="footer-col">
          <h3 className="footer-title">Контакты</h3>
          <ul className="contact-list">
            <li>
              <Phone size={14} className="contact-icon" />
              <a href="tel:+79166411774">+7 (916) 641-17-74</a>
            </li>
            <li>
              <MapPin size={14} className="contact-icon" />
              <span>429120, Чувашская Республика — Чувашия, г. Шумерля, ул. Ломоносова, д. 60, к. 1, кв. 17</span>
            </li>
            <li>
              <Building2 size={14} className="contact-icon" />
              <span>ООО «Атлас Стоун»</span>
            </li>
            <li>
              <FileText size={14} className="contact-icon" />
              <span>ИНН 2100021618 · ОГРН 1242100008677</span>
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
          <p className="copyright">&copy; {new Date().getFullYear()} ООО «Атлас Стоун». Все права защищены.</p>
          <div className="legal-links">
            <a href="#" onClick={(e) => e.preventDefault()}>Политика конфиденциальности</a>
            <span className="divider">|</span>
            <a href="#" onClick={(e) => e.preventDefault()}>Согласие на обработку персональных данных</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
