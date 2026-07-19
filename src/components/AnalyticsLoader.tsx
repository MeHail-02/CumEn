import { useEffect } from 'react';
import { COOKIE_CONSENT_CHANGED_EVENT, readCookiePreference } from '../utils/cookiePreferences';
import { getMetrikaId, METRIKA_SCRIPT_ID, type YandexMetrikaFunction } from '../utils/metrika';

const initializeMetrika = (id: number) => {
  if (document.getElementById(METRIKA_SCRIPT_ID)) return;

  window[`disableYaCounter${id}`] = false;
  if (!window.ym) {
    const queueFunction = ((...args: unknown[]) => {
      queueFunction.a ??= [];
      queueFunction.a.push(args);
    }) as YandexMetrikaFunction;
    queueFunction.l = Date.now();
    window.ym = queueFunction;
  }

  const script = document.createElement('script');
  script.id = METRIKA_SCRIPT_ID;
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  script.onload = () => {
    window.ym?.(id, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: false,
    });
  };
  document.head.appendChild(script);
};

const disableMetrika = (id: number) => {
  window[`disableYaCounter${id}`] = true;
  document.getElementById(METRIKA_SCRIPT_ID)?.remove();
};

export const AnalyticsLoader = () => {
  useEffect(() => {
    const id = getMetrikaId();
    if (!id) return;

    const applyPreference = (preference = readCookiePreference()) => {
      if (preference === 'all') initializeMetrika(id);
      else disableMetrika(id);
    };

    applyPreference();
    const handlePreferenceChange = (event: Event) => {
      applyPreference((event as CustomEvent<'all' | 'necessary'>).detail);
    };
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handlePreferenceChange);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handlePreferenceChange);
  }, []);

  return null;
};
