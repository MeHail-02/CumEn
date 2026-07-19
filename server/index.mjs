import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';
import nodemailer from 'nodemailer';

dotenv.config({ quiet: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDirectory = path.join(projectRoot, 'dist');
const port = Number(process.env.PORT || 8787);
const maxFileSize = 10 * 1024 * 1024;
const maxTotalFileSize = 20 * 1024 * 1024;
const maxFiles = 5;
const rateWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 8;

const formLabels = {
  product_quote: 'Общий расчет изделия',
  stone_quote: 'Расчет изделия из выбранного камня',
  project_quote: 'Проект с чертежами',
  catalog_request: 'Запрос PDF-каталога',
};

const allowedExtensions = new Set(['.pdf', '.dwg', '.jpg', '.jpeg', '.png']);
const attemptsByAddress = new Map();

const cleanText = (value, maxLength = 2000) => String(value ?? '')
  .split(String.fromCharCode(0)).join('')
  .trim()
  .slice(0, maxLength);

const escapeHtml = (value) => cleanText(value, 10000)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhone = (value) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
};

const hasExpectedSignature = (file, extension) => {
  const bytes = file.buffer;
  if (extension === '.pdf') return bytes.subarray(0, 5).toString() === '%PDF-';
  if (extension === '.png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (extension === '.jpg' || extension === '.jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (extension === '.dwg') return /^AC10\d{2}/.test(bytes.subarray(0, 6).toString('ascii'));
  return false;
};

const getRateLimitState = (address) => {
  const now = Date.now();
  const recent = (attemptsByAddress.get(address) ?? []).filter((timestamp) => timestamp > now - rateWindowMs);
  if (recent.length >= maxRequestsPerWindow) {
    attemptsByAddress.set(address, recent);
    return false;
  }
  recent.push(now);
  attemptsByAddress.set(address, recent);
  return true;
};

const smtpConfig = () => ({
  host: process.env.SMTP_HOST || 'smtp.mail.ru',
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE ?? 'true') !== 'false',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSize,
    files: maxFiles,
    fields: 40,
    fieldSize: 20 * 1024,
  },
});

const app = express();
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://mc.yandex.ru'],
      connectSrc: ["'self'", 'https://mc.yandex.ru', 'https://mc.yandex.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://mc.yandex.ru', 'https://mc.yandex.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/leads', upload.array('files', maxFiles), async (request, response) => {
  const requestId = `SITE-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  if (!getRateLimitState(request.ip || request.socket.remoteAddress || 'unknown')) {
    return response.status(429).json({ error: 'Слишком много запросов. Попробуйте позднее.' });
  }

  const honeypot = cleanText(request.body.website, 200);
  if (honeypot) return response.status(202).json({ requestId });

  const formType = cleanText(request.body.formType, 50);
  if (!(formType in formLabels)) {
    return response.status(400).json({ error: 'Неизвестный тип формы.' });
  }

  const fields = {
    name: cleanText(request.body.name, 120),
    phone: cleanText(request.body.phone, 40),
    email: cleanText(request.body.email, 254),
    product: cleanText(request.body.product, 300),
    stone: cleanText(request.body.stone, 300),
    dimensions: cleanText(request.body.dimensions, 500),
    thickness: cleanText(request.body.thickness, 100),
    details: cleanText(request.body.details, 5000),
    pageUrl: cleanText(request.body.pageUrl, 2000),
    referrer: cleanText(request.body.referrer, 2000),
    utmSource: cleanText(request.body.utmSource, 300),
    utmMedium: cleanText(request.body.utmMedium, 300),
    utmCampaign: cleanText(request.body.utmCampaign, 300),
    utmContent: cleanText(request.body.utmContent, 300),
    utmTerm: cleanText(request.body.utmTerm, 300),
    legalVersion: cleanText(request.body.legalVersion, 50),
    submittedAt: cleanText(request.body.submittedAt, 50),
  };

  const policyAccepted = request.body.policyAccepted === 'true';
  const consentAccepted = request.body.consentAccepted === 'true';
  if (!policyAccepted || !consentAccepted || !fields.legalVersion) {
    return response.status(400).json({ error: 'Необходимо принять условия обработки персональных данных.' });
  }

  if (formType === 'catalog_request') {
    if (!isValidEmail(fields.email)) return response.status(400).json({ error: 'Проверьте адрес электронной почты.' });
  } else {
    if (!fields.name) return response.status(400).json({ error: 'Укажите имя.' });
    if (!isValidPhone(fields.phone)) return response.status(400).json({ error: 'Проверьте номер телефона.' });
  }

  if (formType === 'product_quote' && !fields.product) {
    return response.status(400).json({ error: 'Укажите нужное изделие.' });
  }

  const files = request.files ?? [];
  if (files.length > 0 && formType !== 'project_quote') {
    return response.status(400).json({ error: 'Файлы разрешены только в форме проекта.' });
  }

  const totalFileSize = files.reduce((total, file) => total + file.size, 0);
  if (totalFileSize > maxTotalFileSize) {
    return response.status(400).json({ error: 'Общий размер файлов не должен превышать 20 МБ.' });
  }

  for (const file of files) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension) || !hasExpectedSignature(file, extension)) {
      return response.status(400).json({ error: `Файл «${cleanText(file.originalname, 150)}» имеет недопустимый формат.` });
    }
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.LEAD_TO) {
    console.error(`[${requestId}] SMTP configuration is incomplete.`);
    return response.status(503).json({ error: 'Сервис отправки временно не настроен. Позвоните нам по телефону.' });
  }

  const rows = [
    ['Номер заявки', requestId],
    ['Тип обращения', formLabels[formType]],
    ['Имя', fields.name],
    ['Телефон', fields.phone],
    ['Email', fields.email],
    ['Изделие', fields.product],
    ['Камень / материал', fields.stone],
    ['Размеры', fields.dimensions],
    ['Толщина', fields.thickness],
    ['Комментарий', fields.details],
    ['Страница', fields.pageUrl],
    ['Источник перехода', fields.referrer],
    ['UTM source', fields.utmSource],
    ['UTM medium', fields.utmMedium],
    ['UTM campaign', fields.utmCampaign],
    ['UTM content', fields.utmContent],
    ['UTM term', fields.utmTerm],
    ['Дата отправки', fields.submittedAt],
    ['Политика', `ознакомление подтверждено, версия ${fields.legalVersion}`],
    ['Согласие', `получено, версия ${fields.legalVersion}`],
    ['Файлы', files.length ? files.map((file) => file.originalname).join(', ') : 'нет'],
  ].filter(([, value]) => value);

  const textBody = [
    'НОВАЯ ЗАЯВКА С САЙТА ATLAS STONE',
    '',
    ...rows.map(([label, value]) => `• ${label}: ${value}`),
  ].join('\n');
  const htmlBody = `<div style="font-family:Arial,sans-serif;color:#202124;line-height:1.5">
    <h2 style="margin:0 0 18px">Новая заявка с сайта ATLAS STONE&nbsp;</h2>
    ${rows.map(([label, value]) => `<div style="margin:0 0 9px">• <strong>${escapeHtml(label)}:</strong>&nbsp; ${escapeHtml(value).replaceAll('\n', '<br>')}</div>`).join('\n')}
  </div>`;

  try {
    const transporter = nodemailer.createTransport(smtpConfig());
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"ATLAS STONE — сайт" <${process.env.SMTP_USER}>`,
      to: process.env.LEAD_TO,
      replyTo: fields.email || undefined,
      subject: `Заявка с сайта — ${formLabels[formType]}${fields.stone ? ` — ${fields.stone}` : ''} — ${requestId}`,
      text: textBody,
      html: htmlBody,
      attachments: files.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
      })),
    });
    console.info(`[${requestId}] Lead email accepted by SMTP (${formType}).`);
    return response.status(201).json({ requestId });
  } catch (error) {
    console.error(`[${requestId}] SMTP delivery failed:`, error instanceof Error ? error.message : 'unknown error');
    return response.status(502).json({ error: 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.' });
  }
});

app.use(express.static(distDirectory, { maxAge: '1h', etag: true }));
app.use((request, response, next) => {
  if (request.method !== 'GET' || request.path.startsWith('/api/')) return next();
  return response.sendFile(path.join(distDirectory, 'index.html'));
});

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Размер одного файла не должен превышать 10 МБ.'
      : 'Не удалось обработать приложенные файлы.';
    return response.status(400).json({ error: message });
  }
  console.error('Unhandled server error:', error instanceof Error ? error.message : 'unknown error');
  return response.status(500).json({ error: 'Внутренняя ошибка сервера.' });
});

app.listen(port, () => {
  console.info(`ATLAS STONE server is running on http://localhost:${port}`);
});
