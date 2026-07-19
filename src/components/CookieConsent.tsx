import React, { useEffect, useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { createPath } from '../routing';
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_SETTINGS_EVENT,
  readCookiePreference,
  storeCookiePreference,
  type CookiePreference,
} from '../utils/cookiePreferences';
import '../styles/Legal.css';

export const CookieConsent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => readCookiePreference() === null);

  useEffect(() => {
    const storedPreference = readCookiePreference();
    if (storedPreference) document.documentElement.dataset.cookiePreference = storedPreference;

    const openSettings = () => setIsOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings);
  }, []);

  const savePreference = (preference: CookiePreference) => {
    storeCookiePreference(preference);
    document.documentElement.dataset.cookiePreference = preference;
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: preference }));
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <aside className="cookie-consent" aria-labelledby="cookie-consent-title">
      <button
        type="button"
        className="cookie-consent-close"
        onClick={() => savePreference('necessary')}
        aria-label="Использовать только необходимые данные и закрыть"
      >
        <X size={18} />
      </button>
      <div className="cookie-consent-icon" aria-hidden="true"><Cookie size={24} /></div>
      <div className="cookie-consent-copy">
        <h2 id="cookie-consent-title">Настройки cookies</h2>
        <p>
          Сайт использует необходимое хранилище браузера для навигации и сохранения вашего выбора.
          Яндекс.Метрика загружается только после выбора «Разрешить аналитику» и только при настроенном счетчике.{' '}
          <a href={createPath('cookies')}>Подробнее</a>
        </p>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-secondary" onClick={() => savePreference('necessary')}>
          Только необходимые
        </button>
        <button type="button" className="cookie-primary" onClick={() => savePreference('all')}>
          Разрешить аналитику
        </button>
      </div>
    </aside>
  );
};
