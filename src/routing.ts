export type ViewState = 'hub' | 'catalog' | 'detail' | 'services';

export interface RouteState {
  view: ViewState;
  stoneId: string | null;
}

export type Navigate = (view: ViewState, stoneId?: string | null) => void;

export const parsePath = (pathname: string): RouteState => {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  if (normalizedPath === '/catalog') return { view: 'catalog', stoneId: null };
  if (normalizedPath === '/services') return { view: 'services', stoneId: null };
  if (normalizedPath.startsWith('/stone/')) {
    try {
      const stoneId = decodeURIComponent(normalizedPath.slice('/stone/'.length));
      if (stoneId) return { view: 'detail', stoneId };
    } catch {
      // Invalid encoded paths fall through to the home page.
    }
  }

  return { view: 'hub', stoneId: null };
};

export const createPath = (view: ViewState, stoneId: string | null = null) => {
  if (view === 'catalog') return '/catalog';
  if (view === 'services') return '/services';
  if (view === 'detail' && stoneId) return `/stone/${encodeURIComponent(stoneId)}`;
  return '/';
};

export const legacyHashToPath = (hash: string) => {
  if (!hash.startsWith('#/')) return null;
  const legacyPath = hash.slice(1);
  const route = parsePath(legacyPath);
  return createPath(route.view, route.stoneId);
};
