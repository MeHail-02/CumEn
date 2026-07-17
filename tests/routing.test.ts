import { describe, expect, it } from 'vitest';
import { createPath, legacyHashToPath, parsePath } from '../src/routing';

describe('routing', () => {
  it('creates stable public URLs', () => {
    expect(createPath('hub')).toBe('/');
    expect(createPath('catalog')).toBe('/catalog');
    expect(createPath('services')).toBe('/services');
    expect(createPath('detail', 'stone with spaces')).toBe('/stone/stone%20with%20spaces');
  });

  it('parses known paths and safely falls back to the home page', () => {
    expect(parsePath('/catalog/')).toEqual({ view: 'catalog', stoneId: null });
    expect(parsePath('/stone/catalog-marble-white-beauty')).toEqual({
      view: 'detail',
      stoneId: 'catalog-marble-white-beauty',
    });
    expect(parsePath('/unknown')).toEqual({ view: 'hub', stoneId: null });
  });

  it('migrates the old hash routes', () => {
    expect(legacyHashToPath('#/catalog')).toBe('/catalog');
    expect(legacyHashToPath('#/stone/example')).toBe('/stone/example');
    expect(legacyHashToPath('')).toBeNull();
  });
});
