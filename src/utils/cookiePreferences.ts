export type CookiePreference = 'all' | 'necessary';

interface StoredCookiePreference {
  preference: CookiePreference;
  expiresAt: string;
}

export const COOKIE_STORAGE_KEY = 'atlas-cookie-consent-v2';
export const COOKIE_SETTINGS_EVENT = 'atlas-open-cookie-settings';
export const COOKIE_CONSENT_CHANGED_EVENT = 'atlas-cookie-consent-changed';
const COOKIE_PREFERENCE_LIFETIME_MS = 365 * 24 * 60 * 60 * 1000;

export const readCookiePreference = (): CookiePreference | null => {
  try {
    const stored = window.localStorage.getItem(COOKIE_STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredCookiePreference;
    const isKnownPreference = parsed.preference === 'all' || parsed.preference === 'necessary';
    const expiresAt = Date.parse(parsed.expiresAt);
    if (isKnownPreference && Number.isFinite(expiresAt) && expiresAt > Date.now()) {
      return parsed.preference;
    }

    window.localStorage.removeItem(COOKIE_STORAGE_KEY);
    return null;
  } catch {
    return null;
  }
};

export const storeCookiePreference = (preference: CookiePreference) => {
  try {
    const storedPreference: StoredCookiePreference = {
      preference,
      expiresAt: new Date(Date.now() + COOKIE_PREFERENCE_LIFETIME_MS).toISOString(),
    };
    window.localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(storedPreference));
  } catch {
    // The choice still applies for the current page when browser storage is unavailable.
  }
};
