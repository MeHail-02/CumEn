import { stonesData as curatedStonesData } from './stones';
import { veneziaGraniteData } from './veneziaGranite';
import { veneziaLabradoriteData } from './veneziaLabradorite';
import { veneziaMarbleData } from './veneziaMarble';
import { veneziaOniksData } from './veneziaOniks';
import { veneziaQuartziteData } from './veneziaQuartzite';
import { veneziaTravertinData } from './veneziaTravertin';
import type { Stone } from './stones';

const normalizeStoneName = (name: string) => name
  .replace(/^(?:гранит|мрамор|кварцит|оникс|травертин|лабрадорит)\s+/i, '')
  .toLocaleLowerCase('ru-RU')
  .replace(/ё/g, 'е')
  .replace(/[^a-zа-я0-9]+/gi, ' ')
  .trim();

const stoneKey = (stone: Stone) => `${stone.type}:${normalizeStoneName(stone.name)}`;

const mergeUniqueStones = (...groups: Stone[][]) => {
  const seen = new Set<string>();
  return groups.flatMap((group) => group.filter((stone) => {
    const key = stoneKey(stone);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }));
};

// Сохраняем вручную подготовленные карточки и дополняем их ассортиментом Venezia Stone.
// Совпадения по названию не дублируются: более подробная локальная карточка имеет приоритет.
export const stonesData: Stone[] = mergeUniqueStones(
  curatedStonesData,
  veneziaGraniteData,
  veneziaMarbleData,
  veneziaQuartziteData,
  veneziaOniksData,
  veneziaTravertinData,
  veneziaLabradoriteData,
);
