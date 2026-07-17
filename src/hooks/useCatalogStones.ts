import { useEffect, useState } from 'react';
import { loadCatalogStones } from '../data/featuredStones';
import type { Stone } from '../data/stone';

const EMPTY_CATALOG: Stone[] = [];

export const useCatalogStones = () => {
  const [stones, setStones] = useState<Stone[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isActive = true;

    loadCatalogStones()
      .then((catalog) => {
        if (isActive) setStones(catalog);
      })
      .catch((reason: unknown) => {
        if (isActive) setError(reason instanceof Error ? reason : new Error('Не удалось загрузить каталог'));
      });

    return () => {
      isActive = false;
    };
  }, []);

  return {
    stonesData: stones ?? EMPTY_CATALOG,
    isLoading: stones === null && error === null,
    error,
  };
};
