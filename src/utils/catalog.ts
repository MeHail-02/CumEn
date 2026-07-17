export type PhysicalProperty = 'density' | 'waterAbsorption' | 'compressiveStrength';

export const getOriginName = (origin: string) => origin.replace(/\s*\([^)]*\)\s*$/, '').trim();

export const getPhysicalPropertyValue = (value: string | undefined, property: PhysicalProperty) => {
  if (!value) return null;

  const units = property === 'density' ? ['кг/м', 'г/см', 'т/м'] : property === 'waterAbsorption' ? ['%'] : ['мпа'];
  const normalizedValue = value.toLocaleLowerCase('ru-RU');
  const unitIndex = units
    .map(unit => normalizedValue.indexOf(unit))
    .filter(index => index >= 0)
    .sort((a, b) => a - b)[0];
  const valuePart = (unitIndex === undefined ? normalizedValue : normalizedValue.slice(0, unitIndex))
    .replace(/(?<=\d)[\s\u00a0\u202f](?=\d{3}(?:\D|$))/g, '');
  const numbers = valuePart.match(/\d+(?:[.,]\d+)?/g)?.map(number => Number(number.replace(',', '.')));

  if (!numbers?.length) return null;

  const representativeValue = numbers.slice(0, 2).reduce((sum, number) => sum + number, 0) / Math.min(numbers.length, 2);
  const densityMultiplier = property === 'density' && (normalizedValue.includes('г/см') || normalizedValue.includes('т/м')) ? 1000 : 1;
  return representativeValue * densityMultiplier;
};

export const comparePhysicalProperties = (
  a: string | undefined,
  b: string | undefined,
  property: PhysicalProperty,
  direction: 'asc' | 'desc',
) => {
  const aValue = getPhysicalPropertyValue(a, property);
  const bValue = getPhysicalPropertyValue(b, property);

  if (aValue === null) return bValue === null ? 0 : 1;
  if (bValue === null) return -1;
  return direction === 'asc' ? aValue - bValue : bValue - aValue;
};
