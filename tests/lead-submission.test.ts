import { afterEach, describe, expect, it, vi } from 'vitest';
import { LeadSubmissionError, submitLead } from '../src/utils/leadSubmission';

describe('lead submission transport', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    window.history.replaceState(null, '', '/');
  });

  it('sends consent evidence and attribution as multipart data', async () => {
    window.history.replaceState(null, '', '/catalog?utm_source=yandex&utm_campaign=stone-search');
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ requestId: 'SITE-TEST-1' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitLead({
      formType: 'product_quote',
      name: 'Александр',
      phone: '+7 999 000-00-00',
      product: 'Столешница',
      policyAccepted: true,
      consentAccepted: true,
    });

    expect(result.requestId).toBe('SITE-TEST-1');
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const body = request.body as FormData;
    expect(body.get('formType')).toBe('product_quote');
    expect(body.get('legalVersion')).toBe('2026-07-21');
    expect(body.get('policyAccepted')).toBe('true');
    expect(body.get('consentAccepted')).toBe('true');
    expect(body.get('utmSource')).toBe('yandex');
    expect(body.get('utmCampaign')).toBe('stone-search');
  });

  it('returns the safe error message received from the server', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ error: 'Проверьте номер телефона.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )));

    await expect(submitLead({
      formType: 'product_quote',
      name: 'Александр',
      phone: '123',
      product: 'Столешница',
      policyAccepted: true,
      consentAccepted: true,
    })).rejects.toEqual(new LeadSubmissionError('Проверьте номер телефона.'));
  });
});
