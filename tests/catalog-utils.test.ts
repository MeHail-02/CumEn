import { describe, expect, it } from 'vitest';
import { comparePhysicalProperties, getOriginName, getPhysicalPropertyValue } from '../src/utils/catalog';

describe('catalog utilities', () => {
  it('keeps multiword countries and removes only the regional suffix', () => {
    expect(getOriginName('Саудовская Аравия')).toBe('Саудовская Аравия');
    expect(getOriginName('Россия (Башкортостан)')).toBe('Россия');
  });

  it('extracts comparable numbers from physical properties', () => {
    expect(getPhysicalPropertyValue('2 650–2 895 кг/м³', 'density')).toBe(2772.5);
    expect(getPhysicalPropertyValue('0,15 %', 'waterAbsorption')).toBe(0.15);
    expect(getPhysicalPropertyValue(undefined, 'density')).toBeNull();
  });

  it('sorts missing physical values last', () => {
    expect(comparePhysicalProperties('10 МПа', '20 МПа', 'compressiveStrength', 'asc')).toBeLessThan(0);
    expect(comparePhysicalProperties(undefined, '20 МПа', 'compressiveStrength', 'asc')).toBeGreaterThan(0);
  });
});
