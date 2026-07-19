import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ConsentCheckboxes } from '../src/components/ConsentCheckboxes';
import { CookieConsent } from '../src/components/CookieConsent';

const storageValues = new Map<string, string>();
const localStorageMock: Storage = {
  get length() { return storageValues.size; },
  clear: () => storageValues.clear(),
  getItem: (key) => storageValues.get(key) ?? null,
  key: (index) => Array.from(storageValues.keys())[index] ?? null,
  removeItem: (key) => { storageValues.delete(key); },
  setItem: (key, value) => { storageValues.set(key, value); },
};

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: localStorageMock,
});

const ConsentHarness = () => {
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);

  return (
    <ConsentCheckboxes
      idPrefix="test"
      policyAccepted={policyAccepted}
      consentAccepted={consentAccepted}
      onPolicyChange={setPolicyAccepted}
      onConsentChange={setConsentAccepted}
    />
  );
};

describe('personal data controls', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.cookiePreference;
  });

  it('renders two separate required checkboxes that are unchecked by default', () => {
    render(<ConsentHarness />);

    const policyCheckbox = screen.getByRole('checkbox', { name: /ознакомлен/ });
    const consentCheckbox = screen.getByRole('checkbox', { name: /даю отдельное/ });

    expect(policyCheckbox).not.toBeChecked();
    expect(consentCheckbox).not.toBeChecked();
    expect(policyCheckbox).toBeRequired();
    expect(consentCheckbox).toBeRequired();

    fireEvent.click(policyCheckbox);
    fireEvent.click(consentCheckbox);
    expect(policyCheckbox).toBeChecked();
    expect(consentCheckbox).toBeChecked();
  });

  it('keeps analytics disabled when the visitor selects necessary storage only', () => {
    render(<CookieConsent />);

    fireEvent.click(screen.getByRole('button', { name: 'Только необходимые' }));

    const storedPreference = JSON.parse(window.localStorage.getItem('atlas-cookie-consent-v2') ?? '{}');
    expect(storedPreference.preference).toBe('necessary');
    expect(Date.parse(storedPreference.expiresAt)).toBeGreaterThan(Date.now());
    expect(document.documentElement.dataset.cookiePreference).toBe('necessary');
    expect(screen.queryByText('Настройки cookies')).not.toBeInTheDocument();
  });
});
