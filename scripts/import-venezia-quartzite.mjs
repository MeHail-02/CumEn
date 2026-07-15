import { execFile } from 'node:child_process';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const cwd = process.cwd();
const categoryArgument = process.argv.find((argument) => argument.startsWith('--category='));
const categoryKey = categoryArgument?.slice('--category='.length) || 'quartzite';
const categories = {
  quartzite: {
    sourceUrl: 'https://veneziastone.com/quartzite/',
    outputName: 'veneziaQuartzite.ts',
    imageDirectoryName: 'venezia-quartzite',
    idPrefix: 'venezia-quartzite',
    materialTitle: 'Кварцит',
    materialType: 'кварцит',
    exportName: 'veneziaQuartziteData',
    importScript: 'scripts/import-venezia-quartzite.mjs',
    fallbackLead: 'прочный натуральный камень с выразительным природным рисунком, подходящий для интенсивной эксплуатации',
  },
  oniks: {
    sourceUrl: 'https://veneziastone.com/oniks/',
    outputName: 'veneziaOniks.ts',
    imageDirectoryName: 'venezia-oniks',
    idPrefix: 'venezia-oniks',
    materialTitle: 'Оникс',
    materialType: 'оникс',
    exportName: 'veneziaOniksData',
    importScript: 'scripts/import-venezia-oniks.mjs',
    fallbackLead: 'полупрозрачный натуральный камень с выразительными цветными слоями и неповторимым рисунком',
  },
  travertin: {
    sourceUrl: 'https://veneziastone.com/travertin/',
    outputName: 'veneziaTravertin.ts',
    imageDirectoryName: 'venezia-travertin',
    idPrefix: 'venezia-travertin',
    materialTitle: 'Травертин',
    materialType: 'травертин',
    exportName: 'veneziaTravertinData',
    importScript: 'scripts/import-venezia-travertin.mjs',
    fallbackLead: 'натуральный пористый камень с тёплой природной палитрой и характерной слоистой фактурой',
  },
  labradorite: {
    sourceUrl: 'https://veneziastone.com/labradorite/',
    outputName: 'veneziaLabradorite.ts',
    imageDirectoryName: 'venezia-labradorite',
    idPrefix: 'venezia-labradorite',
    materialTitle: 'Лабрадорит',
    materialType: 'лабрадорит',
    exportName: 'veneziaLabradoriteData',
    importScript: 'scripts/import-venezia-labradorite.mjs',
    fallbackLead: 'прочный натуральный камень с крупнокристаллической структурой и характерными переливами минералов',
  },
};
const category = categories[categoryKey];
if (!category) throw new Error(`Неизвестная категория: ${categoryKey}`);

const SOURCE_URL = category.sourceUrl;
const outputFile = path.join(cwd, 'src', 'data', category.outputName);
const imageDirectory = path.join(cwd, 'public', category.imageDirectoryName);
const optimizer = path.join(cwd, 'scripts', 'optimize-venezia-images.py');
const forceImages = process.argv.includes('--force-images');
const execFileAsync = promisify(execFile);

const runOptimizer = async () => {
  const bundledPython = path.join(
    os.homedir(),
    '.cache',
    'codex-runtimes',
    'codex-primary-runtime',
    'dependencies',
    'python',
    'python.exe',
  );
  const candidates = [
    process.env.PYTHON ? { executable: process.env.PYTHON, prefix: [] } : null,
    { executable: bundledPython, prefix: [] },
    { executable: 'python', prefix: [] },
    { executable: 'py', prefix: ['-3'] },
  ].filter(Boolean);
  let lastError;

  for (const candidate of candidates) {
    try {
      return await execFileAsync(candidate.executable, [...candidate.prefix, optimizer, category.imageDirectoryName], {
        cwd,
        maxBuffer: 10 * 1024 * 1024,
      });
    } catch (error) {
      lastError = error;
      if (error.code !== 'ENOENT' && error.code !== 9009) throw error;
    }
  }

  throw new Error(`Не найден Python для оптимизации изображений: ${lastError?.message ?? lastError}`);
};

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const fetchWithRetry = async (url, attempts = 6) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Atlas Stone catalog importer/1.0',
          Accept: 'text/html,application/xhtml+xml,*/*',
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
      return readInertiaPage(await (await fetchWithRetry(url, 1)).text(), url);
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
  бирюзовый: 'синий',
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
  мультиколор: 'коричневый',
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
    .replace(/<\/(?:p|div)\s*>/gi, '\n\n')
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
  if (totalWords < 20) return description;

  const targetWords = Math.max(12, Math.round(totalWords / 2));
  const sentences = description.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];

  if (sentences.length < 2) {
    const words = description.split(/\s+/).slice(0, targetWords);
    return `${words.join(' ').replace(/[,;:]$/, '')}.`;
  }

  const selected = [];
  let selectedWords = 0;
  for (const sentence of sentences) {
    const sentenceWords = countWords(sentence);
    if (selected.length && selectedWords >= targetWords * 0.8 && selectedWords + sentenceWords > targetWords * 1.2) break;
    selected.push(sentence);
    selectedWords += sentenceWords;
    if (selectedWords >= targetWords) break;
  }

  return selected.join(' ');
};

const createFallbackDescription = (name, sourceColors, finishing) => {
  const parts = [`${category.materialTitle} ${name} — ${category.fallbackLead}.`];
  if (sourceColors.length) parts.push(`Основные оттенки: ${sourceColors.map((color) => color.toLowerCase()).join(', ')}.`);
  if (finishing.length) parts.push(`Доступная обработка: ${finishing.map((item) => item.toLowerCase()).join(', ')}.`);
  parts.push('Материал применяют для столешниц, облицовки стен и полов, лестниц, каминов и декоративных панно.');
  return parts.join(' ');
};

const formatThickness = (value) => {
  const normalized = cleanValue(value);
  if (!normalized) return null;
  return /мм/i.test(normalized) ? normalized : `${normalized} мм`;
};

const looksLikeImage = (bytes) => (
  (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
  || (bytes[0] === 0x89 && bytes.subarray(1, 4).toString('ascii') === 'PNG')
  || (bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP')
);

const imageExists = async (filePath) => {
  try {
    const file = await stat(filePath);
    if (file.size < 4_000) return false;
    return looksLikeImage((await readFile(filePath)).subarray(0, 12));
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

// Это именно первое главное изображение карточки. detail.images намеренно не используется:
// там начинается галерея, и images[0] не совпадает с первым фото товара на странице.
const buildImageUrls = (detail) => [...new Set([
  detail.full_image_url,
  detail.stand_image_url,
  detail.image_url,
  detail.thumbnail_url,
].filter(Boolean))];

const downloadImage = async (urls, destination) => {
  if (!forceImages && await imageExists(destination)) return 'skipped';

  const temporary = `${destination}.download`;
  await rm(temporary, { force: true });
  let lastError;

  for (const url of urls) {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      try {
        const bytes = await downloadHttp1(url);
        if (bytes.length < 4_000 || !looksLikeImage(bytes)) {
          throw new Error(`ответ не является изображением (${bytes.length} байт)`);
        }
        await writeFile(temporary, bytes);
        await rename(temporary, destination);
        return 'downloaded';
      } catch (error) {
        lastError = error;
        if (attempt < 4) await sleep(attempt * 1_000);
      }
    }
  }

  await rm(temporary, { force: true });
  throw new Error(`изображение недоступно: ${lastError?.message ?? lastError}`);
};

const firstPage = await fetchPageData(SOURCE_URL);
const sourceMeta = firstPage.props.invGroups.meta;
const lastPage = sourceMeta.last_page;
const pageNumbers = Array.from({ length: lastPage - 1 }, (_, index) => index + 2);

console.log(`Каталог: ${lastPage} страниц, заявлено ${sourceMeta.total} товаров. Загружаю пагинацию…`);
const remainingPages = await mapLimit(pageNumbers, 4, async (pageNumber) => {
  const page = await fetchPageData(`${SOURCE_URL}?page=${pageNumber}`);
  console.log(`  страница ${pageNumber}/${lastPage}`);
  return page;
});

const listings = [firstPage, ...remainingPages].flatMap((page) => page.props.invGroups.data);
const uniqueListings = [...new Map(listings.map((listing) => [listing.url, listing])).values()];
if (uniqueListings.length !== sourceMeta.total) {
  throw new Error(`Количество не совпало: на сайте ${sourceMeta.total}, в пагинации ${uniqueListings.length}`);
}

console.log(`Найдено ${uniqueListings.length} товаров. Загружаю карточки и характеристики…`);
const detailedListings = await mapLimit(uniqueListings, 8, async (listing, index) => {
  const page = await fetchPageData(listing.url);
  const detail = page.props.invGroup;
  if (!detail?.name) throw new Error(`На странице ${listing.url} нет данных товара`);
  if ((index + 1) % 10 === 0 || index + 1 === uniqueListings.length) {
    console.log(`  карточки: ${index + 1}/${uniqueListings.length}`);
  }
  return {
    listing,
    detail,
    surfaces: page.props.surfaces ?? [],
    thicknesses: page.props.thicknesses ?? [],
  };
});

await mkdir(imageDirectory, { recursive: true });
console.log('Загружаю первые главные изображения…');
const failures = [];
let downloadedCount = 0;
let skippedCount = 0;

await mapLimit(detailedListings, 12, async ({ listing, detail }, index) => {
  const slug = slugFromUrl(listing.url);
  const imageUrls = buildImageUrls(detail);
  if (!imageUrls.length) {
    failures.push(`${slug}: у карточки нет главного изображения`);
  } else {
    try {
      const status = await downloadImage(imageUrls, path.join(imageDirectory, `${slug}.webp`));
      if (status === 'downloaded') downloadedCount += 1;
      else skippedCount += 1;
    } catch (error) {
      failures.push(`${slug}: ${error.message}`);
    }
  }

  if ((index + 1) % 10 === 0 || index + 1 === detailedListings.length) {
    console.log(`  изображения: ${index + 1}/${detailedListings.length}`);
  }
});

if (failures.length) {
  throw new Error(`Не загружено ${failures.length} изображений. Повторный запуск докачает только их:\n${failures.join('\n')}`);
}

console.log(`Изображения: новых ${downloadedCount}, уже корректных ${skippedCount}. Оптимизирую только неподходящие файлы…`);
const { stdout: optimizeOutput, stderr: optimizeErrors } = await runOptimizer();
if (optimizeOutput.trim()) console.log(optimizeOutput.trim());
if (optimizeErrors.trim()) console.error(optimizeErrors.trim());

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
  const sourceDescription = detail.description_html ?? detail.description ?? detail.full_description ?? detail.about ?? detail.text;

  return {
    id: `${category.idPrefix}-${slug}`,
    name: detail.h1 || listing.full_name || `${category.materialTitle} ${detail.name}`,
    type: category.materialType,
    color: normalizeColors(detail),
    origin: country,
    price: Number.isFinite(price) ? price : 0,
    image: `/${category.imageDirectoryName}/${slug}.webp`,
    description: shortenDescription(sourceDescription) || createFallbackDescription(detail.name, rawColors, finishing),
    thickness: availableThicknesses.length ? availableThicknesses : ['20 мм'],
    inStock: (detail.availability ?? listing.availability) === 'InStock',
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

const productNames = new Set();
for (const product of products) {
  const key = product.name.toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/gi, ' ').trim();
  if (productNames.has(key)) throw new Error(`Дубликат товара в источнике: ${product.name}`);
  productNames.add(key);
}

const source = `import type { Stone } from './stones';\n\n`
  + `// Автоматически сформировано ${category.importScript}.\n`
  + `// Источник: ${SOURCE_URL}\n`
  + `export const ${category.exportName}: Stone[] = ${JSON.stringify(products, null, 2)};\n`;

await writeFile(outputFile, source, 'utf8');
const generated = await readFile(outputFile, 'utf8');
console.log(`Готово: ${products.length} товаров, файл данных ${Math.round(generated.length / 1024)} КБ.`);
