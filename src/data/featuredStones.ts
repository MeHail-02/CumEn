import type { Stone } from './stone';

export type FeaturedStone = Pick<Stone, 'id' | 'name' | 'type' | 'origin' | 'price' | 'image' | 'rarity' | 'inStock'>;

export const CATALOG_TOTAL_COUNT = 1248;

export const featuredStones: FeaturedStone[] = [
  {
    id: 'catalog-quartzite-cristallo-blue',
    name: 'Кварцит Cristallo Blue',
    type: 'кварцит',
    origin: 'Бразилия',
    price: 74005,
    image: '/catalog-quartzite/cristallo-blue.webp',
    rarity: 'Импорт',
    inStock: true,
  },
  {
    id: 'catalog-marble-white-beauty',
    name: 'Мрамор White Beauty',
    type: 'мрамор',
    origin: 'Италия',
    price: 57466,
    image: '/catalog-marble/white-beauty.webp',
    rarity: 'Импорт',
    inStock: true,
  },
  {
    id: 'catalog-marble-green-abbey',
    name: 'Мрамор Green Abbey',
    type: 'мрамор',
    origin: 'Италия',
    price: 31415,
    image: '/catalog-marble/green-abbey.webp',
    rarity: 'Импорт',
    inStock: true,
  },
  {
    id: 'catalog-oniks-onice-nero-passion',
    name: 'Оникс Onice Nero Passion',
    type: 'оникс',
    origin: 'Италия',
    price: 119510,
    image: '/catalog-oniks/onice-nero-passion.webp',
    rarity: 'Импорт',
    inStock: true,
  },
];

let catalogPromise: Promise<Stone[]> | null = null;

export const loadCatalogStones = () => {
  catalogPromise ??= fetch('/catalog-data.json', {
    headers: { Accept: 'application/json' },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Не удалось загрузить каталог: ${response.status}`);
      return response.json() as Promise<Stone[]>;
    })
    .then((catalog) => {
      if (!Array.isArray(catalog)) throw new Error('Некорректный формат каталога');
      return catalog;
    })
    .catch((error: unknown) => {
      catalogPromise = null;
      throw error;
    });
  return catalogPromise;
};
