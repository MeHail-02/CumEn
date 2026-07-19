import React from 'react';
import { createPath } from '../routing';
import '../styles/Legal.css';

interface ConsentCheckboxesProps {
  idPrefix: string;
  policyAccepted: boolean;
  consentAccepted: boolean;
  onPolicyChange: (accepted: boolean) => void;
  onConsentChange: (accepted: boolean) => void;
  compact?: boolean;
}

export const LEGAL_VERSION = '2026-07-19';

export const ConsentCheckboxes: React.FC<ConsentCheckboxesProps> = ({
  idPrefix,
  policyAccepted,
  consentAccepted,
  onPolicyChange,
  onConsentChange,
  compact = false,
}) => (
  <fieldset className={`consent-checkboxes ${compact ? 'consent-checkboxes-compact' : ''}`}>
    <legend className="visually-hidden">Согласия на обработку персональных данных</legend>

    <label className="consent-checkbox-row" htmlFor={`${idPrefix}-policy`}>
      <input
        id={`${idPrefix}-policy`}
        name="privacy_policy_acknowledged"
        type="checkbox"
        checked={policyAccepted}
        onChange={(event) => onPolicyChange(event.target.checked)}
        required
      />
      <span>
        Я ознакомлен(а) с{' '}
        <a href={createPath('privacy')} target="_blank" rel="noreferrer">
          Политикой обработки персональных данных
        </a>
      </span>
    </label>

    <label className="consent-checkbox-row" htmlFor={`${idPrefix}-consent`}>
      <input
        id={`${idPrefix}-consent`}
        name="personal_data_consent"
        type="checkbox"
        checked={consentAccepted}
        onChange={(event) => onConsentChange(event.target.checked)}
        required
      />
      <span>
        Я даю отдельное{' '}
        <a href={createPath('consent')} target="_blank" rel="noreferrer">
          Согласие на обработку персональных данных
        </a>
      </span>
    </label>

    <input type="hidden" name="privacy_policy_version" value={LEGAL_VERSION} />
    <input type="hidden" name="personal_data_consent_version" value={LEGAL_VERSION} />
  </fieldset>
);
