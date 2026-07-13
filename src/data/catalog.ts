import { stonesData as curatedStonesData } from './stones';
import { veneziaGraniteData } from './veneziaGranite';
import type { Stone } from './stones';

const normalizeStoneName = (name: string) => name
  .replace(/^гранит\s+/i, '')
  .toLocaleLowerCase('ru-RU')
  .replace(/ё/g, 'е')
  .replace(/[^a-zа-я0-9]+/gi, ' ')
  .trim();

const curatedNames = new Set(curatedStonesData.map((stone) => normalizeStoneName(stone.name)));

// Сохраняем вручную подготовленные карточки и дополняем их ассортиментом Venezia Stone.
// Совпадения по названию не дублируются: более подробная локальная карточка имеет приоритет.
export const stonesData: Stone[] = [
  ...curatedStonesData,
  ...veneziaGraniteData.filter((stone) => !curatedNames.has(normalizeStoneName(stone.name))),
];
