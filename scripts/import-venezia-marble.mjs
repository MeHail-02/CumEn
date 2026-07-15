import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';

const SOURCE_URL = 'https://veneziastone.com/marble/';
const cwd = process.cwd();
const outputFile = path.join(cwd, 'src', 'data', 'veneziaMarble.ts');
const imageDirectory = path.join(cwd, 'public', 'venezia-marble');
const forceImages = process.argv.includes('--force-images');
const imageCutoffArgument = process.argv.find((argument) => argument.startsWith('--image-cutoff='));
const imageCutoff = imageCutoffArgument
  ? new Date(imageCutoffArgument.slice('--image-cutoff='.length))
  : null;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const fetchWithRetry = async (url, options = {}, attempts = 6) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Atlas Stone catalog importer/1.0',
          Accept: 'text/html,application/xhtml+xml,image/avif,image/webp,*/*',
          ...options.headers,
        },
        signal: AbortSignal.timeout(60_000),
      });

      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 1_200);
    }
  }

  throw new Error(`Не удалось загрузить ${url}: ${lastError?.message ?? lastError}`);
};

const readInertiaPage = (html, url) => {
  const marker = '<script data-page="__venezia" type="application/json">';
  const markerIndex = html.indexOf(marker);

  if (markerIndex === -1) throw new Error(`На странице ${url} не найден блок данных каталога`);

  const jsonStart = markerIndex + marker.length;
  const jsonEnd = html.indexOf('</script>', jsonStart);

  if (jsonEnd === -1) throw new Error(`На странице ${url} повреждён блок данных каталога`);
  return JSON.parse(html.slice(jsonStart, jsonEnd));
};

const fetchPageData = async (url, attempts = 6) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetchWithRetry(url, {}, 1);
      return readInertiaPage(await response.text(), url);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 1_200);
    }
  }

  throw new Error(`Не удалось прочитать данные ${url}: ${lastError?.message ?? lastError}`);
};

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

const slugFromUrl = (url) => new URL(url).pathname.split('/').filter(Boolean).at(-1);

const colorMap = {
  белый: 'белый',
  черный: 'черный',
  чёрный: 'черный',
  зеленый: 'зеленый',
  зелёный: 'зеленый',
  голубой: 'синий',
  синий: 'синий',
  бежевый: 'бежевый',
  кремовый: 'бежевый',
  серый: 'серый',
  серебристый: 'серый',
  коричневый: 'коричневый',
  красный: 'красный',
  бордовый: 'красный',
  оранжевый: 'желтый',
  желтый: 'желтый',
  жёлтый: 'желтый',
  золотой: 'желтый',
  розовый: 'розовый',
  фиолетовый: 'розовый',
};

const normalizeColors = (invGroup) => {
  const sourceColors = [
    ...(invGroup.colors ?? []).map((color) => color?.name),
    invGroup.main_color?.name,
  ].filter(Boolean);
  const colors = [...new Set(sourceColors.map((color) => colorMap[color.toLowerCase()]).filter(Boolean))];
  return colors.length > 1 ? colors : colors[0] ?? 'серый';
};

const decodeHtmlEntities = (value) => value
  .replace(/&nbsp;/gi, ' ')
  .replace(/&mdash;|&#8212;/gi, '—')
  .replace(/&ndash;|&#8211;/gi, '–')
  .replace(/&laquo;|&#171;/gi, '«')
  .replace(/&raquo;|&#187;/gi, '»')
  .replace(/&quot;|&#34;/gi, '"')
  .replace(/&amp;|&#38;/gi, '&')
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));

const cleanValue = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  return decodeHtmlEntities(String(value))
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const countWords = (value) => value.split(/\s+/).filter(Boolean).length;

const shortenDescription = (value) => {
  const withoutHeading = typeof value === 'string'
    ? value.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ')
    : value;
  const description = cleanValue(withoutHeading) ?? '';
  const totalWords = countWords(description);
  if (totalWords < 28) return description;

  const targetWords = Math.max(18, Math.round(totalWords / 2));
  const sentences = description.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
  if (sentences.length < 2) return description;

  const selected = [];
  let selectedWords = 0;

  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);
    const nextWords = selectedWords + sentenceWords;

    if (selected.length && selectedWords >= targetWords * 0.8 && nextWords > targetWords * 1.2) break;
    selected.push(sentence);
    selectedWords = nextWords;
    if (selectedWords >= targetWords) break;
  }

  return selected.join(' ');
};

const createFallbackDescription = (name, sourceColors, finishing) => {
  const colors = sourceColors.map((color) => color.toLowerCase());
  const parts = [`Мрамор ${name} — натуральный камень с выразительным природным рисунком и благородной кристаллической фактурой.`];
  if (colors.length) parts.push(`Основные оттенки: ${colors.join(', ')}.`);
  if (finishing.length) parts.push(`Доступные варианты обработки: ${finishing.map((item) => item.toLowerCase()).join(', ')}.`);
  parts.push('Подходит для облицовки стен и полов, лестниц, подоконников, каминов, столешниц и декоративных интерьерных элементов.');
  return parts.join(' ');
};

const formatThickness = (value) => {
  const normalized = cleanValue(value);
  if (!normalized) return null;
  return /мм/i.test(normalized) ? normalized : `${normalized} мм`;
};

const imageExists = async (filePath) => {
  try {
    return (await stat(filePath)).size > 4_000;
  } catch {
    return false;
  }
};

const imageIsNewerThanCutoff = async (filePath) => {
  if (!imageCutoff || Number.isNaN(imageCutoff.getTime())) return false;

  try {
    const file = await stat(filePath);
    return file.size > 4_000 && file.mtime >= imageCutoff;
  } catch {
    return false;
  }
};

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

const buildImageUrls = (listing, detail) => {
  const original = listing.img?.url ?? detail.full_image_url;
  const resized = original
    ? `https://cdn.veneziastone.com/234dfwer3r/resize:fill:850:500/enlarge:1/gravity:ce/format:webp/plain/${original}`
    : null;

  return [...new Set([
    detail.full_image_url,
    detail.stand_image_url,
    detail.image_url,
    resized,
    detail.thumbnail_url,
    detail.og_image_url,
    original,
  ].filter(Boolean).map((url) => encodeURI(url)))];
};

const downloadImage = async (urls, destination, force = false) => {
  if (await imageIsNewerThanCutoff(destination)) return true;
  if (!force && await imageExists(destination)) return true;
  let lastError;

  for (const url of urls) {
    try {
      const bytes = await downloadHttp1(url);
      if (bytes.length < 4_000) throw new Error(`подозрительно маленький размер (${bytes.length} байт)`);
      await writeFile(destination, bytes);
      return true;
    } catch (error) {
      lastError = error;
    }
  }

  console.warn(`  предупреждение: изображение недоступно (${lastError?.message ?? lastError})`);
  return false;
};

const firstPage = await fetchPageData(SOURCE_URL);
const lastPage = firstPage.props.invGroups.meta.last_page;
const pageNumbers = Array.from({ length: lastPage - 1 }, (_, index) => index + 2);

console.log(`Каталог: ${lastPage} страниц, загружаю список товаров…`);

const remainingPages = await mapLimit(pageNumbers, 4, async (pageNumber) => {
  const page = await fetchPageData(`${SOURCE_URL}?page=${pageNumber}`);
  console.log(`  страница ${pageNumber}/${lastPage}`);
  return page;
});

const listings = [firstPage, ...remainingPages].flatMap((page) => page.props.invGroups.data);
const uniqueListings = [...new Map(listings.map((listing) => [listing.url, listing])).values()];

if (uniqueListings.length !== firstPage.props.invGroups.meta.total) {
  throw new Error(`Ожидалось ${firstPage.props.invGroups.meta.total} товаров, получено ${uniqueListings.length}`);
}

console.log(`Найдено ${uniqueListings.length} товаров. Загружаю характеристики…`);

const detailedListings = await mapLimit(uniqueListings, 8, async (listing, index) => {
  const page = await fetchPageData(listing.url);
  const detail = page.props.invGroup;
  if (!detail?.name) throw new Error(`На странице ${listing.url} нет данных товара`);

  if ((index + 1) % 10 === 0 || index + 1 === uniqueListings.length) {
    console.log(`  характеристики: ${index + 1}/${uniqueListings.length}`);
  }

  return {
    listing,
    detail,
    surfaces: page.props.surfaces ?? [],
    thicknesses: page.props.thicknesses ?? [],
  };
});

await mkdir(imageDirectory, { recursive: true });
console.log('Загружаю изображения…');

const failedImageSlugs = new Set();
await mapLimit(detailedListings, 16, async ({ listing, detail }, index) => {
  const slug = slugFromUrl(listing.url);
  const imageUrls = buildImageUrls(listing, detail);
  if (!imageUrls.length) {
    console.warn(`  предупреждение: у товара ${listing.name} нет изображения`);
    failedImageSlugs.add(slug);
  } else if (!await downloadImage(
    imageUrls,
    path.join(imageDirectory, `${slug}.webp`),
    forceImages,
  )) {
    failedImageSlugs.add(slug);
  }

  if ((index + 1) % 10 === 0 || index + 1 === detailedListings.length) {
    console.log(`  изображения: ${index + 1}/${detailedListings.length}`);
  }
});

const products = detailedListings.map(({ listing, detail, surfaces, thicknesses }) => {
  const slug = slugFromUrl(listing.url);
  const rawColors = [...new Set([
    ...(detail.colors ?? []).map((color) => color?.name),
    detail.main_color?.name,
  ].filter(Boolean))];
  const country = detail.country?.name ?? 'Страна уточняется';
  const finishing = [...new Set(surfaces.map((surface) => cleanValue(surface.name)).filter(Boolean))];
  const availableThicknesses = [...new Set(thicknesses.map((item) => formatThickness(item.value)).filter(Boolean))];
  const price = Number(detail.minimum_price_rub ?? listing.min_price ?? 0);
  const inStock = (detail.availability ?? listing.availability) === 'InStock';
  const sourceDescription = detail.description_html ?? detail.description ?? detail.full_description ?? detail.about ?? detail.text;

  return {
    id: `venezia-marble-${slug}`,
    name: detail.h1 || listing.full_name || `Мрамор ${detail.name}`,
    type: 'мрамор',
    color: normalizeColors(detail),
    origin: country,
    price: Number.isFinite(price) ? price : 0,
    image: failedImageSlugs.has(slug) ? '/stone-placeholder.webp' : `/venezia-marble/${slug}.webp`,
    description: shortenDescription(sourceDescription) || createFallbackDescription(detail.name, rawColors, finishing),
    thickness: availableThicknesses.length ? availableThicknesses : ['20 мм'],
    inStock,
    slabSize: 'Размер и формат уточняются по текущей партии',
    rarity: country.toLowerCase().includes('росси') ? 'Россия' : 'Импорт',
    density: cleanValue(detail.density),
    waterAbsorption: cleanValue(detail.water_absorption),
    frostResistance: cleanValue(detail.frost_resistance),
    abrasion: cleanValue(detail.abradability),
    isPriceFrom: price > 0 && !detail.is_on_request,
    sourceUrl: listing.url,
  };
});

const source = `import type { Stone } from './stones';\n\n` +
  `// Автоматически сформировано scripts/import-venezia-marble.mjs.\n` +
  `// Источник: ${SOURCE_URL}\n` +
  `export const veneziaMarbleData: Stone[] = ${JSON.stringify(products, null, 2)};\n`;

await writeFile(outputFile, source, 'utf8');
const generated = await readFile(outputFile, 'utf8');
console.log(`Готово: ${products.length} товаров, файл данных ${Math.round(generated.length / 1024)} КБ.`);
