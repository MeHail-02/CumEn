import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { StoneImage } from './StoneImage';
import { createPath, type Navigate } from '../routing';
import { comparePhysicalProperties, getOriginName, type PhysicalProperty } from '../utils/catalog';
import { useModalDialog } from '../hooks/useModalDialog';
import { useCatalogStones } from '../hooks/useCatalogStones';
import '../styles/Catalog.css';

interface CatalogProps {
  setView: Navigate;
}

type StoneTypeFilter = 'all' | 'мрамор' | 'гранит' | 'кварцит' | 'оникс' | 'травертин' | 'лабрадорит';
type ColorFilter = 'all' | 'белый' | 'черный' | 'зеленый' | 'синий' | 'бежевый' | 'серый' | 'коричневый' | 'красный' | 'желтый' | 'розовый';
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'density-desc' | 'water-asc' | 'strength-desc';
const CATALOG_PAGE_SIZE = 24;

const PHYSICAL_SORT_CONFIG: Partial<Record<SortOption, { property: PhysicalProperty; label: string }>> = {
  'density-desc': { property: 'density', label: 'Плотность' },
  'water-asc': { property: 'waterAbsorption', label: 'Водопоглощение' },
  'strength-desc': { property: 'compressiveStrength', label: 'Прочность при сжатии' },
};

const CATALOG_STORAGE_KEY = 'atlas-catalog-state';
const CATALOG_SCROLL_KEY = 'atlas-catalog-scroll';

interface StoredCatalogState {
  search: string;
  selectedType: StoneTypeFilter;
  selectedColor: ColorFilter;
  selectedOrigin: string;
  sortBy: SortOption;
  visibleCount: number;
}

const DEFAULT_CATALOG_STATE: StoredCatalogState = {
  search: '',
  selectedType: 'all',
  selectedColor: 'all',
  selectedOrigin: 'all',
  sortBy: 'default',
  visibleCount: CATALOG_PAGE_SIZE,
};

const readCatalogState = (): StoredCatalogState => {
  try {
    const stored = window.sessionStorage.getItem(CATALOG_STORAGE_KEY);
    return stored ? { ...DEFAULT_CATALOG_STATE, ...JSON.parse(stored) as Partial<StoredCatalogState> } : DEFAULT_CATALOG_STATE;
  } catch {
    return DEFAULT_CATALOG_STATE;
  }
};

export const Catalog: React.FC<CatalogProps> = ({ setView }) => {
  const { stonesData, isLoading, error } = useCatalogStones();
  const initialState = useMemo(readCatalogState, []);
  const [search, setSearch] = useState(initialState.search);
  const [selectedType, setSelectedType] = useState<StoneTypeFilter>(initialState.selectedType);
  const [selectedColor, setSelectedColor] = useState<ColorFilter>(initialState.selectedColor);
  const [sortBy, setSortBy] = useState<SortOption>(initialState.sortBy);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(initialState.visibleCount);
  const hasMountedRef = useRef(false);
  const closeMobileFilters = () => setMobileFiltersOpen(false);
  const mobileFiltersRef = useModalDialog<HTMLDivElement>(mobileFiltersOpen, closeMobileFilters);

  // Extract unique origins for filter option if needed (or keep it simple with type/color)
  const origins = useMemo(() => {
    const allOrigins = stonesData.map(stone => getOriginName(stone.origin));
    return ['all', ...Array.from(new Set(allOrigins)).sort((first, second) => first.localeCompare(second, 'ru-RU'))];
  }, [stonesData]);
  
  const [selectedOrigin, setSelectedOrigin] = useState(initialState.selectedOrigin);

  // Filter and sort logic
  const filteredStones = useMemo(() => {
    let result = [...stonesData];

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      result = result.filter(s => s.type === selectedType);
    }

    // Color filter
    if (selectedColor !== 'all') {
      result = result.filter(s => 
        Array.isArray(s.color)
          ? s.color.includes(selectedColor as any)
          : s.color === selectedColor
      );
    }

    // Origin filter
    if (selectedOrigin !== 'all') {
      result = result.filter(s => s.origin.startsWith(selectedOrigin));
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        if (a.price === 0) return b.price === 0 ? 0 : 1;
        if (b.price === 0) return -1;
        return a.price - b.price;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        if (a.price === 0) return b.price === 0 ? 0 : 1;
        if (b.price === 0) return -1;
        return b.price - a.price;
      });
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'density-desc') {
      result.sort((a, b) => comparePhysicalProperties(a.density, b.density, 'density', 'desc'));
    } else if (sortBy === 'water-asc') {
      result.sort((a, b) => comparePhysicalProperties(a.waterAbsorption, b.waterAbsorption, 'waterAbsorption', 'asc'));
    } else if (sortBy === 'strength-desc') {
      result.sort((a, b) => comparePhysicalProperties(a.compressiveStrength, b.compressiveStrength, 'compressiveStrength', 'desc'));
    }

    return result;
  }, [stonesData, search, selectedType, selectedColor, selectedOrigin, sortBy]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    setVisibleCount(CATALOG_PAGE_SIZE);
  }, [search, selectedType, selectedColor, selectedOrigin, sortBy]);

  useEffect(() => {
    window.sessionStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify({
      search,
      selectedType,
      selectedColor,
      selectedOrigin,
      sortBy,
      visibleCount,
    } satisfies StoredCatalogState));
  }, [search, selectedType, selectedColor, selectedOrigin, sortBy, visibleCount]);

  useEffect(() => {
    const savedScroll = Number(window.sessionStorage.getItem(CATALOG_SCROLL_KEY));
    if (!Number.isFinite(savedScroll) || savedScroll <= 0) return;
    const animationFrame = window.requestAnimationFrame(() => window.scrollTo({ top: savedScroll, behavior: 'auto' }));
    return () => window.cancelAnimationFrame(animationFrame);
  }, [stonesData.length]);

  const visibleStones = filteredStones.slice(0, visibleCount);
  const activePhysicalSort = PHYSICAL_SORT_CONFIG[sortBy];

  const handleCardClick = (event: React.MouseEvent<HTMLAnchorElement>, stoneId: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.sessionStorage.setItem(CATALOG_SCROLL_KEY, String(window.scrollY));
    window.sessionStorage.setItem('atlas-detail-origin', stoneId);
    setView('detail', stoneId);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedColor('all');
    setSelectedOrigin('all');
    setSortBy('default');
  };

  const isFiltered = search.trim() !== '' || selectedType !== 'all' || selectedColor !== 'all' || selectedOrigin !== 'all';

  if (isLoading) return <div className="route-loading" role="status">Загружаем каталог…</div>;
  if (error) return <div className="route-error" role="alert">Не удалось загрузить каталог. Обновите страницу и попробуйте снова.</div>;

  return (
    <div className="catalog-page fade-in">
      {/* Intro Header */}
      <section className="catalog-header">
        <div className="container">
          <span className="catalog-tag">Материалы</span>
          <h1 className="catalog-title">Галерея камней</h1>
          <p className="catalog-subtitle">
            Каждый камень уникален. Рисунок вен, глубина цвета и прочность — созданные самой природой в течение миллионов лет.
          </p>
        </div>
      </section>

      {/* Catalog Main Interface */}
      <div className="container catalog-container">
        {/* Search & Sort Panel */}
        <div className="catalog-toolbar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              aria-label="Поиск по каталогу"
              placeholder="Поиск по названию или стране..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="clear-search" onClick={() => setSearch('')} aria-label="Очистить поиск">
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="toolbar-actions">
            {/* Mobile Filter Toggle */}
            <button
              className="mobile-filter-btn"
              onClick={() => setMobileFiltersOpen(true)}
              aria-expanded={mobileFiltersOpen}
              aria-controls="catalog-mobile-filters"
            >
              <SlidersHorizontal size={18} />
              <span>Фильтры</span>
            </button>

            {/* Sorting */}
            <div className="sort-dropdown-container">
              <ArrowUpDown size={16} className="sort-icon" />
              <select 
                aria-label="Сортировка каталога"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="sort-select"
              >
                <option value="default">По умолчанию</option>
                <option value="price-asc">Цена: по возрастанию</option>
                <option value="price-desc">Цена: по убыванию</option>
                <option value="name-asc">Название: А - Я</option>
                <option value="density-desc">Плотность: выше</option>
                <option value="water-asc">Водопоглощение: ниже</option>
                <option value="strength-desc">Прочность: выше</option>
              </select>
            </div>
          </div>
        </div>

        <div className="catalog-layout">
          {/* Desktop Sidebar Filters */}
          <aside className="catalog-sidebar">
            <div className="sidebar-section">
              <h3 className="filter-title">Тип камня</h3>
              <div className="filter-options">
                {(['all', 'мрамор', 'гранит', 'кварцит', 'оникс', 'травертин', 'лабрадорит'] as StoneTypeFilter[]).map(type => (
                  <button 
                    key={type}
                    className={`filter-btn ${selectedType === type ? 'active' : ''}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type === 'all' ? 'Все типы' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3 className="filter-title">Оттенок</h3>
              <div className="filter-options color-options">
                {(['all', 'белый', 'черный', 'зеленый', 'синий', 'бежевый', 'серый', 'коричневый', 'красный', 'желтый', 'розовый'] as ColorFilter[]).map(color => (
                  <button 
                    key={color}
                    className={`filter-btn color-btn ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color === 'all' ? (
                      <span>Все цвета</span>
                    ) : (
                      <>
                        <span className={`color-dot color-dot-${color}`} />
                        <span>{color}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <h3 className="filter-title">Происхождение</h3>
              <div className="filter-options">
                {origins.map(origin => (
                  <button 
                    key={origin}
                    className={`filter-btn ${selectedOrigin === origin ? 'active' : ''}`}
                    onClick={() => setSelectedOrigin(origin)}
                  >
                    {origin === 'all' ? 'Все страны' : origin}
                  </button>
                ))}
              </div>
            </div>

            {isFiltered && (
              <button className="btn-clear-all" onClick={clearFilters}>
                Сбросить фильтры
              </button>
            )}
          </aside>

          {/* Catalog Grid */}
          <section className="catalog-grid-container" aria-label="Результаты каталога">
            <div className="active-filters-row">
              <span className="results-count">
                {isFiltered ? 'Найдено' : 'В каталоге'} позиций: {filteredStones.length}
              </span>
              {isFiltered && (
                <div className="active-filter-chips" aria-label="Активные фильтры">
                  {search.trim() && (
                    <button
                      type="button"
                      className="active-filter-chip"
                      onClick={() => setSearch('')}
                      aria-label={`Убрать фильтр поиска: ${search.trim()}`}
                    >
                      <span>Поиск: «{search.trim()}»</span>
                      <X size={13} aria-hidden="true" />
                    </button>
                  )}
                  {selectedType !== 'all' && (
                    <button
                      type="button"
                      className="active-filter-chip"
                      onClick={() => setSelectedType('all')}
                      aria-label={`Убрать фильтр по типу: ${selectedType}`}
                    >
                      <span>{selectedType}</span>
                      <X size={13} aria-hidden="true" />
                    </button>
                  )}
                  {selectedColor !== 'all' && (
                    <button
                      type="button"
                      className="active-filter-chip"
                      onClick={() => setSelectedColor('all')}
                      aria-label={`Убрать фильтр по цвету: ${selectedColor}`}
                    >
                      <span>{selectedColor}</span>
                      <X size={13} aria-hidden="true" />
                    </button>
                  )}
                  {selectedOrigin !== 'all' && (
                    <button
                      type="button"
                      className="active-filter-chip"
                      onClick={() => setSelectedOrigin('all')}
                      aria-label={`Убрать фильтр по происхождению: ${selectedOrigin}`}
                    >
                      <span>{selectedOrigin}</span>
                      <X size={13} aria-hidden="true" />
                    </button>
                  )}
                  <button type="button" className="clear-filter-chips" onClick={clearFilters}>
                    Сбросить всё
                  </button>
                </div>
              )}
            </div>

            {filteredStones.length > 0 ? (
              <div className="stone-grid">
                {visibleStones.map(stone => (
                  <article key={stone.id}>
                    <a
                      className="stone-card"
                      href={createPath('detail', stone.id)}
                      onClick={(event) => handleCardClick(event, stone.id)}
                    >
                    <div className="card-image-wrapper">
                      <StoneImage src={stone.image} alt={stone.name} className="card-image" loading="lazy" />
                      <div className="card-overlay" />
                      
                      {/* Rarity & Stock badges */}
                      <span className={`rarity-badge rarity-${stone.id}`}>{stone.rarity}</span>
                      <span className={`stock-badge ${stone.inStock ? 'in-stock' : 'pre-order'}`}>
                        {stone.inStock ? 'В наличии' : 'Под заказ'}
                      </span>
                    </div>

                    <div className="card-info">
                      <span className="stone-type">{stone.type} &bull; {stone.origin}</span>
                      <h3 className="stone-name">{stone.name}</h3>
                      {activePhysicalSort && (
                        <div className="stone-physical-property">
                          <span>{activePhysicalSort.label}</span>
                          <strong>{stone[activePhysicalSort.property] ?? 'Нет данных'}</strong>
                        </div>
                      )}
                      <div className="card-footer">
                        <span className="stone-price">
                          {stone.price === 0 ? 'цена по запросу' : <>от {stone.price.toLocaleString('ru-RU')} <span className="currency">₽ / м²</span></>}
                        </span>
                        <span className="card-view-details">Детали &rarr;</span>
                      </div>
                    </div>
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>Подходящие камни не найдены</h3>
                <p>Попробуйте смягчить параметры фильтрации или сбросить их.</p>
                <button className="btn-gold" onClick={clearFilters}>Сбросить всё</button>
              </div>
            )}

            {visibleCount < filteredStones.length && (
              <div className="load-more-row">
                <button
                  type="button"
                  className="btn-gold"
                  onClick={() => setVisibleCount((count) => count + CATALOG_PAGE_SIZE)}
                >
                  Показать ещё
                  <span className="load-more-count">
                    {Math.min(CATALOG_PAGE_SIZE, filteredStones.length - visibleCount)} позиций
                  </span>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mobile Drawer Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="mobile-filter-drawer open">
          <button type="button" className="drawer-overlay" onClick={closeMobileFilters} aria-label="Закрыть фильтры" />
          <div
            id="catalog-mobile-filters"
            ref={mobileFiltersRef}
            className="drawer-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-mobile-filters-title"
            tabIndex={-1}
          >
            <div className="drawer-header">
              <h3 id="catalog-mobile-filters-title">Фильтры</h3>
              <button onClick={closeMobileFilters} aria-label="Закрыть фильтры"><X size={20} /></button>
            </div>
            
            <div className="drawer-body">
              {/* Type Filter */}
              <div className="drawer-section">
                <h4>Тип камня</h4>
                <div className="drawer-flex-options">
                  {(['all', 'мрамор', 'гранит', 'кварцит', 'оникс', 'травертин', 'лабрадорит'] as StoneTypeFilter[]).map(type => (
                    <button 
                      key={type}
                      className={`drawer-option-btn ${selectedType === type ? 'active' : ''}`}
                      onClick={() => setSelectedType(type)}
                    >
                      {type === 'all' ? 'Все' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div className="drawer-section">
                <h4>Оттенок</h4>
                <div className="drawer-flex-options">
                  {(['all', 'белый', 'черный', 'зеленый', 'синий', 'бежевый', 'серый', 'коричневый', 'красный', 'желтый', 'розовый'] as ColorFilter[]).map(color => (
                    <button 
                      key={color}
                      className={`drawer-option-btn ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color === 'all' ? 'Все цвета' : color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Origin Filter */}
              <div className="drawer-section">
                <h4>Происхождение</h4>
                <div className="drawer-flex-options">
                  {origins.map(origin => (
                    <button 
                      key={origin}
                      className={`drawer-option-btn ${selectedOrigin === origin ? 'active' : ''}`}
                      onClick={() => setSelectedOrigin(origin)}
                    >
                      {origin === 'all' ? 'Все страны' : origin}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              {isFiltered && (
                <button className="btn-reset-mobile" onClick={clearFilters}>Сбросить всё</button>
              )}
              <button className="btn-apply-mobile" onClick={closeMobileFilters}>Показать ({filteredStones.length})</button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Component Styles */}
    </div>
  );
};
