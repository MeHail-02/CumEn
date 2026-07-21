const defaultTimeoutMs = 20_000;
const siteFilesXmlId = 'ATLAS_STONE_SITE_FILES';

export class Bitrix24Error extends Error {
  constructor(message, { code = 'BITRIX24_ERROR', cause } = {}) {
    super(message, { cause });
    this.name = 'Bitrix24Error';
    this.code = code;
  }
}

const normalizeWebhookUrl = (value) => {
  let url;
  try {
    url = new URL(String(value ?? '').trim());
  } catch {
    throw new Bitrix24Error('Неверный URL вебхука Битрикс24.', { code: 'INVALID_WEBHOOK_URL' });
  }

  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Bitrix24Error('URL вебхука Битрикс24 должен использовать HTTPS.', { code: 'INVALID_WEBHOOK_URL' });
  }

  url.search = '';
  url.hash = '';
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url;
};

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Bitrix24Error('Битрикс24 вернул некорректный ответ.', { code: 'INVALID_RESPONSE' });
  }
};

export const createBitrix24Client = ({
  webhookUrl,
  fileFieldCode,
  sourceId = 'WEB',
  statusId,
  fetchImpl = globalThis.fetch,
  timeoutMs = defaultTimeoutMs,
}) => {
  const baseUrl = normalizeWebhookUrl(webhookUrl);
  let fileFieldCodePromise;

  if (typeof fetchImpl !== 'function') {
    throw new Bitrix24Error('На сервере недоступен HTTP-клиент.', { code: 'FETCH_UNAVAILABLE' });
  }

  const call = async (method, params = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response;

    try {
      response = await fetchImpl(new URL(`${method}.json`, baseUrl), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        signal: controller.signal,
      });
    } catch (error) {
      const timedOut = error?.name === 'AbortError';
      throw new Bitrix24Error(
        timedOut ? 'Битрикс24 не ответил вовремя.' : 'Не удалось связаться с Битрикс24.',
        { code: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR', cause: error },
      );
    } finally {
      clearTimeout(timeout);
    }

    const payload = await parseResponse(response);
    if (!response.ok || payload.error) {
      const description = String(payload.error_description || payload.error || `HTTP ${response.status}`);
      throw new Bitrix24Error(`Ошибка Битрикс24: ${description}`, {
        code: String(payload.error || `HTTP_${response.status}`),
      });
    }

    return payload.result;
  };

  const getFileFieldCode = async () => {
    if (fileFieldCode) return String(fileFieldCode).trim();

    fileFieldCodePromise ??= call('crm.lead.userfield.list', {
      filter: { XML_ID: siteFilesXmlId },
    }).then(async (fields) => {
      const existingField = Array.isArray(fields) ? fields[0] : undefined;
      if (existingField?.FIELD_NAME) return existingField.FIELD_NAME;

      const fieldId = await call('crm.lead.userfield.add', {
        fields: {
          FIELD_NAME: 'ATLAS_STONE_SITE_FILES',
          EDIT_FORM_LABEL: 'Файлы с сайта',
          LIST_COLUMN_LABEL: 'Файлы с сайта',
          LIST_FILTER_LABEL: 'Файлы с сайта',
          USER_TYPE_ID: 'file',
          XML_ID: siteFilesXmlId,
          MULTIPLE: 'Y',
          SHOW_IN_LIST: 'Y',
        },
      });
      const createdField = await call('crm.lead.userfield.get', { id: fieldId });
      if (!createdField?.FIELD_NAME) {
        throw new Bitrix24Error('Битрикс24 не вернул код поля «Файлы с сайта».', { code: 'FILE_FIELD_NOT_CREATED' });
      }
      return createdField.FIELD_NAME;
    }).catch((error) => {
      fileFieldCodePromise = undefined;
      throw error;
    });

    return fileFieldCodePromise;
  };

  const createLead = async ({
    title,
    name,
    phone,
    email,
    sourceDescription,
    comments,
    utm = {},
    files = [],
  }) => {
    const fields = {
      TITLE: title,
      SOURCE_ID: sourceId || 'WEB',
      SOURCE_DESCRIPTION: sourceDescription,
      COMMENTS: comments,
      ...(name ? { NAME: name } : {}),
      ...(phone ? { PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }] } : {}),
      ...(email ? { EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }] } : {}),
      ...(statusId ? { STATUS_ID: statusId } : {}),
      ...(utm.source ? { UTM_SOURCE: utm.source } : {}),
      ...(utm.medium ? { UTM_MEDIUM: utm.medium } : {}),
      ...(utm.campaign ? { UTM_CAMPAIGN: utm.campaign } : {}),
      ...(utm.content ? { UTM_CONTENT: utm.content } : {}),
      ...(utm.term ? { UTM_TERM: utm.term } : {}),
    };

    if (files.length) {
      const fieldCode = await getFileFieldCode();
      fields[fieldCode] = files.map((file) => ({
        fileData: [file.originalname, file.buffer.toString('base64')],
      }));
    }

    const leadId = await call('crm.lead.add', { fields, params: { REGISTER_SONET_EVENT: 'Y' } });
    if (!leadId) throw new Bitrix24Error('Битрикс24 не вернул ID созданного лида.', { code: 'LEAD_ID_MISSING' });
    return String(leadId);
  };

  return { createLead };
};
