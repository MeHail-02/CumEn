export const METRIKA_SCRIPT_ID = 'yandex-metrika-script';

export type YandexMetrikaFunction = ((...args: unknown[]) => void) & {
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    ym?: YandexMetrikaFunction;
    [key: `disableYaCounter${number}`]: boolean | undefined;
  }
}

export const getMetrikaId = () => {
  const value = import.meta.env.VITE_YANDEX_METRIKA_ID;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const reachMetrikaGoal = (goal: string) => {
  const id = getMetrikaId();
  if (!id || document.documentElement.dataset.cookiePreference !== 'all') return;
  window.ym?.(id, 'reachGoal', goal);
};
