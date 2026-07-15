import { readFile, writeFile } from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';

const cwd = process.cwd();
const dataFile = path.join(cwd, 'src', 'data', 'veneziaMarble.ts');
const imageDirectory = path.join(cwd, 'public', 'venezia-marble');
const marker = 'export const veneziaMarbleData: Stone[] = ';
const pageMarker = '<script data-page="__venezia" type="application/json">';
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const mapLimit = async (items, limit, worker) => {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
};

const source = await readFile(dataFile, 'utf8');
const products = JSON.parse(source.slice(source.indexOf(marker) + marker.length).trim().replace(/;$/, ''));
const failedProducts = products.filter((product) => product.image === '/stone-placeholder.webp');

const downloadHttp1 = (url, redirects = 5) => new Promise((resolve, reject) => {
  const hostname = new URL(url).hostname;
  const request = https.get(encodeURI(url), {
    rejectUnauthorized: !['veneziastone.com', 'www.veneziastone.com', 'cdn.veneziastone.com'].includes(hostname),
    headers: {
      'User-Agent': 'Atlas Stone catalog importer/1.0',
      Accept: 'image/avif,image/webp,image/*,*/*',
      Connection: 'close',
    },
  }, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects > 0) {
      response.resume();
      resolve(downloadHttp1(new URL(response.headers.location, url).href, redirects - 1));
      return;
    }

    if (response.statusCode !== 200) {
      response.resume();
      reject(new Error(`${response.statusCode} ${response.statusMessage}`));
      return;
    }

    const chunks = [];
    response.on('data', (chunk) => chunks.push(chunk));
    response.on('end', () => resolve(Buffer.concat(chunks)));
    response.on('error', reject);
  });

  request.setTimeout(120_000, () => request.destroy(new Error('HTTP/1.1 timeout')));
  request.on('error', reject);
});

const fetchBytes = async (url, attempts = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const bytes = await downloadHttp1(url);
      if (bytes.length < 1_000) throw new Error(`слишком маленький файл (${bytes.length} байт)`);
      return bytes;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 2_000);
    }
  }

  throw lastError;
};

const fetchDetail = async (url) => {
  const html = (await fetchBytes(url, 5)).toString('utf8');
  const markerIndex = html.indexOf(pageMarker);
  if (markerIndex < 0) throw new Error('в карточке не найдены данные товара');
  const start = markerIndex + pageMarker.length;
  return JSON.parse(html.slice(start, html.indexOf('</script>', start))).props.invGroup;
};

const results = await mapLimit(failedProducts, 4, async (product) => {
  try {
    const detail = await fetchDetail(product.sourceUrl);
    const candidates = [
      detail.full_image_url,
      detail.stand_image_url,
      detail.image_url,
      detail.thumbnail_url,
    ].filter(Boolean);

    if (!candidates.length) throw new Error('в карточке нет основного изображения');

    let lastError;
    for (const candidate of candidates) {
      try {
        const bytes = await fetchBytes(candidate);
        const slug = new URL(product.sourceUrl).pathname.split('/').filter(Boolean).at(-1);
        await writeFile(path.join(imageDirectory, `${slug}.webp`), bytes);
        product.image = `/venezia-marble/${slug}.webp`;
        return { name: product.name, ok: true, bytes: bytes.length };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  } catch (error) {
    return { name: product.name, ok: false, error: error?.message ?? String(error) };
  }
});

const generated = `import type { Stone } from './stones';\n\n` +
  `// Автоматически сформировано scripts/import-venezia-marble.mjs.\n` +
  `// Источник: https://veneziastone.com/marble/\n` +
  `export const veneziaMarbleData: Stone[] = ${JSON.stringify(products, null, 2)};\n`;

await writeFile(dataFile, generated, 'utf8');

for (const result of results) {
  console.log(result.ok
    ? `Готово: ${result.name} (${Math.round(result.bytes / 1024)} КБ)`
    : `Не удалось: ${result.name} — ${result.error}`);
}

console.log(`Успешно: ${results.filter((result) => result.ok).length}/${results.length}`);
