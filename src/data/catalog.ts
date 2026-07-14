import { stonesData as curatedStonesData } from './stones';
import { veneziaGraniteData } from './veneziaGranite';
import { veneziaMarbleData } from './veneziaMarble';
import type { Stone } from './stones';

const normalizeStoneName = (name: string) => name
  .replace(/^(?:гранит|мрамор)\s+/i, '')
  .toLocaleLowerCase('ru-RU')
  .replace(/ё/g, 'е')
  .replace(/[^a-zа-я0-9]+/gi, ' ')
  .trim();

const stoneKey = (stone: Stone) => `${stone.type}:${normalizeStoneName(stone.name)}`;
const curatedStoneKeys = new Set(curatedStonesData.map(stoneKey));

// Сохраняем вручную подготовленные карточки и дополняем их ассортиментом Venezia Stone.
// Совпадения по названию не дублируются: более подробная локальная карточка имеет приоритет.
export const stonesData: Stone[] = [
  ...curatedStonesData,
  ...veneziaGraniteData.filter((stone) => !curatedStoneKeys.has(stoneKey(stone))),
  ...veneziaMarbleData.filter((stone) => !curatedStoneKeys.has(stoneKey(stone))),
];
