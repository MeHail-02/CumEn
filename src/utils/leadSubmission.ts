import { LEGAL_VERSION } from '../components/ConsentCheckboxes';

export type LeadFormType = 'product_quote' | 'stone_quote' | 'project_quote' | 'catalog_request';

export interface LeadSubmission {
  formType: LeadFormType;
  policyAccepted: boolean;
  consentAccepted: boolean;
  website?: string;
  name?: string;
  phone?: string;
  email?: string;
  product?: string;
  stone?: string;
  dimensions?: string;
  thickness?: string;
  details?: string;
}

interface LeadResponse {
  requestId: string;
}

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

const readAttribution = () => {
  const params = new URLSearchParams(window.location.search);
  const values: Record<string, string> = {};
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) values[key] = value.slice(0, 300);
  });
  return values;
};

export class LeadSubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeadSubmissionError';
  }
}

export const submitLead = async (submission: LeadSubmission, files: File[] = []): Promise<LeadResponse> => {
  const data = new FormData();
  const attribution = readAttribution();
  const commonFields: Record<string, string | boolean | undefined> = {
    ...submission,
    pageUrl: window.location.href,
    referrer: document.referrer,
    utmSource: attribution.utm_source,
    utmMedium: attribution.utm_medium,
    utmCampaign: attribution.utm_campaign,
    utmContent: attribution.utm_content,
    utmTerm: attribution.utm_term,
    legalVersion: LEGAL_VERSION,
    submittedAt: new Date().toISOString(),
  };

  Object.entries(commonFields).forEach(([key, value]) => {
    if (value !== undefined && value !== '') data.append(key, String(value));
  });
  files.forEach((file) => data.append('files', file, file.name));

  let response: Response;
  try {
    response = await fetch('/api/leads', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
    });
  } catch {
    throw new LeadSubmissionError('Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.');
  }

  const result = await response.json().catch(() => ({})) as Partial<LeadResponse> & { error?: string };
  if (!response.ok || !result.requestId) {
    throw new LeadSubmissionError(result.error || 'Не удалось отправить заявку. Попробуйте ещё раз.');
  }

  return { requestId: result.requestId };
};
