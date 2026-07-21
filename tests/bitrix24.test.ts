import { describe, expect, it, vi } from 'vitest';
import { Bitrix24Error, createBitrix24Client } from '../server/bitrix24.mjs';

const jsonResponse = (result: unknown, status = 200) => new Response(
  JSON.stringify(result),
  { status, headers: { 'Content-Type': 'application/json' } },
);

describe('Bitrix24 client', () => {
  it('creates a lead with attribution and files without assigning an employee', async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
      const method = new URL(String(input)).pathname.split('/').at(-1);
      if (method === 'crm.lead.userfield.list.json') return jsonResponse({ result: [] });
      if (method === 'crm.lead.userfield.add.json') return jsonResponse({ result: 77 });
      if (method === 'crm.lead.userfield.get.json') {
        return jsonResponse({ result: { ID: '77', FIELD_NAME: 'UF_CRM_77' } });
      }
      if (method === 'crm.lead.add.json') return jsonResponse({ result: 321 });
      throw new Error(`Unexpected method ${method}: ${init?.body}`);
    });
    const client = createBitrix24Client({
      webhookUrl: 'https://example.bitrix24.ru/rest/1/secret/',
      fetchImpl: fetchMock,
    });

    const leadId = await client.createLead({
      title: 'Заявка с сайта — SITE-TEST-1',
      name: 'Александр',
      phone: '+7 999 000-00-00',
      email: 'customer@example.com',
      sourceDescription: 'ATLAS STONE — Проект с чертежами',
      comments: 'Номер заявки: SITE-TEST-1',
      utm: { source: 'yandex', campaign: 'stone-search' },
      files: [{ originalname: 'project.pdf', buffer: Buffer.from('PDF test') }],
    });

    expect(leadId).toBe('321');
    const leadCall = fetchMock.mock.calls.find(([input]) => String(input).endsWith('/crm.lead.add.json'));
    expect(leadCall).toBeDefined();
    const body = JSON.parse(String(leadCall?.[1]?.body));
    expect(body.fields).not.toHaveProperty('ASSIGNED_BY_ID');
    expect(body.fields).toMatchObject({
      TITLE: 'Заявка с сайта — SITE-TEST-1',
      NAME: 'Александр',
      SOURCE_ID: 'WEB',
      UTM_SOURCE: 'yandex',
      UTM_CAMPAIGN: 'stone-search',
      UF_CRM_77: [{ fileData: ['project.pdf', Buffer.from('PDF test').toString('base64')] }],
    });
  });

  it('uses a configured file field without requesting CRM field metadata', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ result: 654 }));
    const client = createBitrix24Client({
      webhookUrl: 'https://example.bitrix24.ru/rest/1/secret',
      fileFieldCode: 'UF_CRM_FILES',
      fetchImpl: fetchMock,
    });

    await expect(client.createLead({
      title: 'Запрос каталога',
      email: 'customer@example.com',
    })).resolves.toBe('654');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0]).endsWith('/crm.lead.add.json')).toBe(true);
  });

  it('does not expose the webhook secret in API errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      error: 'INVALID_CREDENTIALS',
      error_description: 'Invalid credentials',
    }, 401));
    const client = createBitrix24Client({
      webhookUrl: 'https://example.bitrix24.ru/rest/1/super-secret/',
      fetchImpl: fetchMock,
    });

    const result = client.createLead({ title: 'Заявка' });
    await expect(result).rejects.toBeInstanceOf(Bitrix24Error);
    await expect(result).rejects.not.toThrow('super-secret');
  });
});
