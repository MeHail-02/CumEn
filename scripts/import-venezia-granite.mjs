import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_URL = 'https://veneziastone.com/granite/';
const cwd = process.cwd();
const outputFile = path.join(cwd, 'src', 'data', 'veneziaGranite.ts');
const imageDirectory = path.join(cwd, 'public', 'venezia-granite');

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

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

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

  if (markerIndex === -1) {
    throw new Error(`На странице ${url} не найден блок данных каталога`);
  }

  const jsonStart = markerIndex + marker.length;
  const jsonEnd = html.indexOf('</script>', jsonStart);

  if (jsonEnd === -1) {
    throw new Error(`На странице ${url} повреждён блок данных каталога`);
  }

  return JSON.parse(html.slice(jsonStart, jsonEnd));
};

const fetchPageData = async (url) => {
  const response = await fetchWithRetry(url);
  const html = await response.text();
  return readInertiaPage(html, url);
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

const slugFromUrl = (url) => {
  const pathname = new URL(url).pathname;
  return pathname.split('/').filter(Boolean).at(-1);
};

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

const cleanValue = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const formatThickness = (value) => {
  const normalized = cleanValue(value);
  if (!normalized) return null;
  return /мм/i.test(normalized) ? normalized : `${normalized} мм`;
};

const joinRussian = (items) => {
  if (items.length < 2) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} и ${items.at(-1)}`;
};

const createDescription = (name, sourceColors, finishing, thicknesses, detail) => {
  const colors = sourceColors.map((color) => color.toLowerCase());
  const sentences = [
    `Гранит ${name} — натуральный камень с плотной кристаллической структурой и выразительной минеральной фактурой.`,
  ];

  if (colors.length) {
    sentences.push(`${colors.length === 1 ? 'Характерный цвет природной палитры' : 'Характерные цвета природной палитры'}: ${joinRussian(colors)}.`);
  }
  const resistance = [
    detail.damage_resistant && 'механическим повреждениям',
    detail.heat_resistant && 'нагреву и перепадам температуры',
    detail.stains_resistant && 'образованию пятен',
    detail.uv_resistance && 'воздействию ультрафиолета',
  ].filter(Boolean);

  if (resistance.length) {
    sentences.push(`Материал устойчив к ${joinRussian(resistance)}, поэтому хорошо сохраняет внешний вид при интенсивной эксплуатации.`);
  } else {
    sentences.push('Плотная минеральная структура придаёт материалу прочность, износостойкость и устойчивость к повседневным нагрузкам.');
  }

  const specifications = [
    cleanValue(detail.density) && `плотность ${cleanValue(detail.density)}`,
    cleanValue(detail.water_absorption) && `водопоглощение ${cleanValue(detail.water_absorption)}`,
    cleanValue(detail.frost_resistance) && `морозостойкость ${cleanValue(detail.frost_resistance)}`,
    cleanValue(detail.abradability) && `истираемость ${cleanValue(detail.abradability)}`,
    cleanValue(detail.strength_on_the_mohs_scale) && `твёрдость ${cleanValue(detail.strength_on_the_mohs_scale)} по шкале Мооса`,
  ].filter(Boolean);

  if (specifications.length) {
    sentences.push(`Физико-механические показатели: ${specifications.join('; ')}.`);
  }

  if (finishing.length) {
    sentences.push(`Варианты обработки поверхности: ${joinRussian(finishing.map((item) => item.toLowerCase()))}. ${finishing.length === 1 ? 'Такая обработка раскрывает' : 'Эти виды обработки раскрывают'} цвет и минеральную структуру материала.`);
  }

  if (thicknesses.length) {
    sentences.push(`Доступные варианты толщины: ${joinRussian(thicknesses)}.`);
  }

  sentences.push('Гранит используют для столешниц, стеновых панелей, полов, ступеней, подоконников, каминных порталов, фасадной облицовки и других интерьерных или архитектурных изделий.');

  return sentences.join(' ');
};

const imageExists = async (filePath) => {
  try {
    return (await stat(filePath)).size > 4_000;
  } catch {
    return false;
  }
};

const buildImageUrls = (listing, detail) => {
  const original = listing.img?.url ?? detail.full_image_url;
  const resized = original
    ? `https://cdn.veneziastone.com/234dfwer3r/resize:fill:850:500/enlarge:1/gravity:ce/format:webp/plain/${original}`
    : null;

  return [...new Set([
    detail.image_url,
    resized,
    detail.thumbnail_url,
    detail.og_image_url,
    ...(detail.images ?? []).flatMap((image) => [
      image.url,
      image.preview_url,
      image.src_url,
      image.thumbnail_url,
    ]),
    original,
  ].filter(Boolean).map((url) => encodeURI(url)))];
};

const downloadImage = async (urls, destination) => {
  if (await imageExists(destination)) return;
  let lastError;

  for (const url of urls) {
    try {
      const response = await fetchWithRetry(
        url,
        { headers: { Accept: 'image/avif,image/webp,image/*,*/*' } },
        3,
      );
      const bytes = Buffer.from(await response.arrayBuffer());

      if (bytes.length < 4_000) {
        throw new Error(`Изображение имеет подозрительно маленький размер (${bytes.length} байт)`);
      }

      await writeFile(destination, bytes);
      return;
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

const detailedListings = await mapLimit(uniqueListings, 6, async (listing, index) => {
  const page = await fetchPageData(listing.url);
  const detail = page.props.invGroup;

  if (!detail?.name) {
    throw new Error(`На странице ${listing.url} нет данных товара`);
  }

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

await mapLimit(detailedListings, 6, async ({ listing, detail }, index) => {
  const slug = slugFromUrl(listing.url);
  const imageUrls = buildImageUrls(listing, detail);

  if (!imageUrls.length) throw new Error(`У товара ${listing.name} нет изображения`);
  const downloaded = await downloadImage(imageUrls, path.join(imageDirectory, `${slug}.webp`));
  if (downloaded === false) failedImageSlugs.add(slug);

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
  const availableThicknesses = [...new Set(
    thicknesses.map((thickness) => formatThickness(thickness.value)).filter(Boolean),
  )];
  const price = Number(detail.minimum_price_rub ?? listing.min_price ?? 0);
  const inStock = (detail.availability ?? listing.availability) === 'InStock';

  return {
    id: `venezia-${slug}`,
    name: detail.h1 || listing.full_name || `Гранит ${detail.name}`,
    type: 'гранит',
    color: normalizeColors(detail),
    origin: country,
    price: Number.isFinite(price) ? price : 0,
    image: failedImageSlugs.has(slug) ? '/Absolute-Black.jpg' : `/venezia-granite/${slug}.webp`,
    description: createDescription(detail.name, rawColors, finishing, availableThicknesses, detail),
    thickness: availableThicknesses.length ? availableThicknesses : ['20 мм'],
    finishing: finishing.length ? finishing : ['Полированная'],
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
  `// Автоматически сформировано scripts/import-venezia-granite.mjs.\n` +
  `// Источник: ${SOURCE_URL}\n` +
  `export const veneziaGraniteData: Stone[] = ${JSON.stringify(products, null, 2)};\n`;

await writeFile(outputFile, source, 'utf8');

const generated = await readFile(outputFile, 'utf8');
console.log(`Готово: ${products.length} товаров, файл данных ${Math.round(generated.length / 1024)} КБ.`);
