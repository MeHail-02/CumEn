import React, { useState } from 'react';
import { Building2, FileText, Mail, MapPin, Phone } from 'lucide-react';
import { createPath, type Navigate, type ViewState } from '../routing';
import { ConsentCheckboxes } from './ConsentCheckboxes';
import { COOKIE_SETTINGS_EVENT } from '../utils/cookiePreferences';
import { useLeadSubmission } from '../hooks/useLeadSubmission';
import '../styles/Footer.css';

interface FooterProps {
  setView: Navigate;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterPolicyAccepted, setNewsletterPolicyAccepted] = useState(false);
  const [newsletterConsentAccepted, setNewsletterConsentAccepted] = useState(false);
  const catalogSubmission = useLeadSubmission();

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

  const handleLegalClick = (event: React.MouseEvent<HTMLAnchorElement>, view: ViewState) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setView(view, null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleNewsletterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newsletterEmail || !newsletterPolicyAccepted || !newsletterConsentAccepted) return;
    const formData = new FormData(event.currentTarget);
    const sent = await catalogSubmission.send({
      formType: 'catalog_request',
      email: newsletterEmail,
      policyAccepted: newsletterPolicyAccepted,
      consentAccepted: newsletterConsentAccepted,
      website: String(formData.get('website') ?? ''),
    }, 'catalog_request_sent');
    if (sent) {
      setNewsletterEmail('');
      setNewsletterPolicyAccepted(false);
      setNewsletterConsentAccepted(false);
    }
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
              <Mail size={14} className="contact-icon" />
              <a href="mailto:sale@atlas-stone.ru">sale@atlas-stone.ru</a>
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
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input className="form-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="newsletter-fields">
              <input
                type="email"
                name="email"
                aria-label="Email для получения каталога"
                placeholder="Ваш E-mail"
                className="news-input"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                required
              />
              <button
                type="submit"
                className="news-submit"
                disabled={!newsletterPolicyAccepted || !newsletterConsentAccepted || catalogSubmission.isSubmitting}
              >
                {catalogSubmission.isSubmitting ? 'Отправляем…' : 'Получить'}
              </button>
            </div>
            <ConsentCheckboxes
              idPrefix="newsletter"
              policyAccepted={newsletterPolicyAccepted}
              consentAccepted={newsletterConsentAccepted}
              onPolicyChange={setNewsletterPolicyAccepted}
              onConsentChange={setNewsletterConsentAccepted}
              compact
            />
            {catalogSubmission.submitError && <p className="form-submit-error" role="alert">{catalogSubmission.submitError}</p>}
            {catalogSubmission.requestId && (
              <p className="newsletter-success" role="status">
                Запрос принят. Номер обращения: <strong>{catalogSubmission.requestId}</strong>
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-flex">
          <p className="copyright">&copy; {new Date().getFullYear()} ООО «Атлас Стоун». Все права защищены.</p>
          <div className="legal-links">
            <a href={createPath('privacy')} onClick={(event) => handleLegalClick(event, 'privacy')}>Политика обработки персональных данных</a>
            <span className="divider">|</span>
            <a href={createPath('consent')} onClick={(event) => handleLegalClick(event, 'consent')}>Согласие на обработку персональных данных</a>
            <span className="divider">|</span>
            <a href={createPath('cookies')} onClick={(event) => handleLegalClick(event, 'cookies')}>Политика cookies</a>
            <span className="divider">|</span>
            <button type="button" onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}>Настройки cookies</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
