import React, { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { stonesData } from '../data/catalog';

interface CatalogProps {
  setView: (view: 'hub' | 'catalog' | 'detail' | 'services', stoneId?: string | null) => void;
}

type StoneTypeFilter = 'all' | 'мрамор' | 'гранит' | 'кварцит' | 'оникс' | 'травертин' | 'лабрадорит';
type ColorFilter = 'all' | 'белый' | 'черный' | 'зеленый' | 'синий' | 'бежевый' | 'серый' | 'коричневый' | 'красный' | 'желтый' | 'розовый';
type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'density-desc' | 'water-asc' | 'strength-desc';
const CATALOG_PAGE_SIZE = 24;

type PhysicalProperty = 'density' | 'waterAbsorption' | 'compressiveStrength';

const PHYSICAL_SORT_CONFIG: Partial<Record<SortOption, { property: PhysicalProperty; label: string }>> = {
  'density-desc': { property: 'density', label: 'Плотность' },
  'water-asc': { property: 'waterAbsorption', label: 'Водопоглощение' },
  'strength-desc': { property: 'compressiveStrength', label: 'Прочность при сжатии' },
};

const getPhysicalPropertyValue = (value: string | undefined, property: PhysicalProperty) => {
  if (!value) return null;

  const units = property === 'density' ? ['кг/м', 'г/см', 'т/м'] : property === 'waterAbsorption' ? ['%'] : ['мпа'];
  const normalizedValue = value.toLocaleLowerCase('ru-RU');
  const unitIndex = units
    .map(unit => normalizedValue.indexOf(unit))
    .filter(index => index >= 0)
    .sort((a, b) => a - b)[0];
  const valuePart = unitIndex === undefined ? normalizedValue : normalizedValue.slice(0, unitIndex);
  const numbers = valuePart.match(/\d+(?:[.,]\d+)?/g)?.map(number => Number(number.replace(',', '.')));

  if (!numbers?.length) return null;

  const representativeValue = numbers.slice(0, 2).reduce((sum, number) => sum + number, 0) / Math.min(numbers.length, 2);
  const densityMultiplier = property === 'density' && (normalizedValue.includes('г/см') || normalizedValue.includes('т/м')) ? 1000 : 1;
  return representativeValue * densityMultiplier;
};

const comparePhysicalProperties = (
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

export const Catalog: React.FC<CatalogProps> = ({ setView }) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<StoneTypeFilter>('all');
  const [selectedColor, setSelectedColor] = useState<ColorFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(CATALOG_PAGE_SIZE);

  // Extract unique origins for filter option if needed (or keep it simple with type/color)
  const origins = useMemo(() => {
    const allOrigins = stonesData.map(s => s.origin.split(' ')[0]); // e.g. "Италия"
    return ['all', ...Array.from(new Set([...allOrigins, 'Бразилия', 'Китай', 'Узбекистан']))];
  }, []);
  
  const [selectedOrigin, setSelectedOrigin] = useState('all');

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
  }, [search, selectedType, selectedColor, selectedOrigin, sortBy]);

  useEffect(() => {
    setVisibleCount(CATALOG_PAGE_SIZE);
  }, [search, selectedType, selectedColor, selectedOrigin, sortBy]);

  const visibleStones = filteredStones.slice(0, visibleCount);
  const activePhysicalSort = PHYSICAL_SORT_CONFIG[sortBy];

  const handleCardClick = (stoneId: string) => {
    setView('detail', stoneId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedColor('all');
    setSelectedOrigin('all');
    setSortBy('default');
  };

  const isFiltered = search.trim() !== '' || selectedType !== 'all' || selectedColor !== 'all' || selectedOrigin !== 'all';

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
              placeholder="Поиск по названию или стране..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="toolbar-actions">
            {/* Mobile Filter Toggle */}
            <button className="mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)}>
              <SlidersHorizontal size={18} />
              <span>Фильтры</span>
            </button>

            {/* Sorting */}
            <div className="sort-dropdown-container">
              <ArrowUpDown size={16} className="sort-icon" />
              <select 
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
          <main className="catalog-grid-container">
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
                  <article 
                    key={stone.id} 
                    className="stone-card"
                    onClick={() => handleCardClick(stone.id)}
                  >
                    <div className="card-image-wrapper">
                      <img src={stone.image} alt={stone.name} className="card-image" loading="lazy" />
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
          </main>
        </div>
      </div>

      {/* Mobile Drawer Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="mobile-filter-drawer open">
          <div className="drawer-overlay" onClick={() => setMobileFiltersOpen(false)} />
          <div className="drawer-content">
            <div className="drawer-header">
              <h3>Фильтры</h3>
              <button onClick={() => setMobileFiltersOpen(false)}><X size={20} /></button>
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
              <button className="btn-apply-mobile" onClick={() => setMobileFiltersOpen(false)}>Показать ({filteredStones.length})</button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Component Styles */}
      <style>{`
        .catalog-page {
          padding-top: 140px;
          padding-bottom: 80px;
        }

        .catalog-header {
          padding: 40px 0;
          text-align: center;
        }

        .catalog-tag {
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          color: var(--color-accent-gold);
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }

        .catalog-title {
          font-size: clamp(2rem, 4vw, 3.2rem);
          color: #ffffff;
          margin-bottom: 15px;
        }

        .catalog-subtitle {
          max-width: 650px;
          margin: 0 auto;
          font-size: 0.95rem;
          color: var(--color-text-dark-muted);
          font-weight: 300;
          line-height: 1.6;
        }

        /* Toolbar */
        .catalog-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 768px) {
          .catalog-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
        }

        .search-box {
          position: relative;
          flex-grow: 1;
          max-width: 480px;
          display: flex;
          align-items: center;
        }

        @media (max-width: 768px) {
          .search-box {
            max-width: 100%;
          }
        }

        .search-icon {
          position: absolute;
          left: 16px;
          color: var(--color-text-dark-muted);
          pointer-events: none;
        }

        .search-box input {
          width: 100%;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 14px 16px 14px 48px;
          color: #ffffff;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          outline: none;
          transition: var(--transition-fast);
        }

        .search-box input:focus {
          border-color: var(--color-accent-gold);
          background-color: rgba(255, 255, 255, 0.05);
        }

        .clear-search {
          position: absolute;
          right: 16px;
          color: var(--color-text-dark-muted);
        }

        .clear-search:hover {
          color: #ffffff;
        }

        .toolbar-actions {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .mobile-filter-btn {
          display: none;
          align-items: center;
          gap: 10px;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        @media (max-width: 900px) {
          .mobile-filter-btn {
            display: flex;
            flex-grow: 1;
            justify-content: center;
          }
        }

        .sort-dropdown-container {
          display: flex;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0 16px;
          height: 48px;
        }

        @media (max-width: 900px) {
          .sort-dropdown-container {
            flex-grow: 1;
            justify-content: center;
          }
        }

        .sort-icon {
          color: var(--color-accent-gold);
          margin-right: 10px;
        }

        .sort-select {
          background: transparent;
          border: none;
          color: #ffffff;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
          height: 100%;
          min-width: 0;
        }

        @media (max-width: 600px) {
          .toolbar-actions {
            display: grid;
            grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
            gap: 10px;
          }

          .mobile-filter-btn,
          .sort-dropdown-container {
            min-width: 0;
            padding-right: 10px;
            padding-left: 10px;
          }

          .sort-icon {
            flex: 0 0 auto;
            margin-right: 6px;
          }

          .sort-select {
            width: 100%;
          }
        }

        .sort-select option {
          background-color: var(--color-bg-dark);
          color: #ffffff;
        }

        /* Catalog Layout */
        .catalog-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 50px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .catalog-layout {
            grid-template-columns: 1fr;
          }
        }

        /* Sidebar filters */
        .catalog-sidebar {
          position: sticky;
          top: 100px;
          display: flex;
          flex-direction: column;
          gap: 35px;
        }

        @media (max-width: 900px) {
          .catalog-sidebar {
            display: none;
          }
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .filter-title {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #ffffff;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .filter-btn {
          text-align: left;
          font-size: 0.88rem;
          color: var(--color-text-dark-muted);
          transition: var(--transition-fast);
          padding: 6px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-btn:hover {
          color: var(--color-accent-gold);
          transform: translateX(4px);
        }

        .filter-btn.active {
          color: var(--color-accent-gold);
          font-weight: 500;
        }

        .color-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .color-dot-белый { background-color: #ffffff; }
        .color-dot-черный { background-color: #121212; border-color: rgba(255,255,255,0.3); }
        .color-dot-зеленый { background-color: #1b4d3e; }
        .color-dot-синий { background-color: #1a365d; }
        .color-dot-бежевый { background-color: #f5f5dc; }
        .color-dot-серый { background-color: #8a8d91; }
        .color-dot-коричневый { background-color: #8b4513; }
        .color-dot-красный { background-color: #a52a2a; }
        .color-dot-желтый { background-color: #ffd700; }
        .color-dot-розовый { background-color: #ffb7c5; }

        .btn-clear-all {
          margin-top: 10px;
          padding: 12px;
          border: 1px dashed rgba(197, 168, 128, 0.4);
          color: var(--color-accent-gold);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: center;
          transition: var(--transition-fast);
        }

        .btn-clear-all:hover {
          border-style: solid;
          border-color: var(--color-accent-gold);
          background-color: var(--color-accent-gold-light);
        }

        /* Results / Grid */
        .catalog-grid-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .active-filters-row {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.85rem;
          color: var(--color-text-dark-muted);
        }

        .active-filter-chips {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }

        .active-filter-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          max-width: min(100%, 320px);
          padding: 7px 10px;
          border: 1px solid var(--color-accent-gold-border);
          background-color: var(--color-accent-gold-light);
          color: var(--color-accent-gold);
          font-size: 0.75rem;
          transition: var(--transition-fast);
        }

        .active-filter-chip span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .active-filter-chip:hover,
        .active-filter-chip:focus-visible {
          border-color: var(--color-accent-gold);
          background-color: rgba(197, 168, 128, 0.16);
        }

        .clear-filter-chips {
          padding: 7px 4px;
          color: var(--color-text-dark-muted);
          font-size: 0.75rem;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: var(--transition-fast);
        }

        .clear-filter-chips:hover,
        .clear-filter-chips:focus-visible {
          color: #ffffff;
        }

        .stone-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }

        .load-more-row {
          display: flex;
          justify-content: center;
          padding-top: 24px;
        }

        .load-more-row .btn-gold {
          gap: 12px;
        }

        .load-more-count {
          font-size: 0.68rem;
          letter-spacing: 0.05em;
          opacity: 0.72;
        }

        /* Stone Card */
        .stone-card {
          background-color: var(--color-bg-card-dark);
          border: 1px solid rgba(255, 255, 255, 0.03);
          cursor: pointer;
          overflow: hidden;
          transition: var(--transition-smooth);
        }

        .stone-card:hover {
          transform: translateY(-6px);
          border-color: var(--color-accent-gold-border);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .card-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 75%; /* 4:3 Aspect Ratio */
          overflow: hidden;
        }

        .card-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .card-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(15,16,18,0.7) 0%, rgba(15,16,18,0) 50%);
          opacity: 0.8;
        }

        .stone-card:hover .card-image {
          transform: scale(1.08);
        }

        /* Card badges */
        .rarity-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          padding: 4px 8px;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          background-color: rgba(0, 0, 0, 0.7);
          border: 1px solid var(--color-accent-gold);
          color: var(--color-accent-gold);
        }

        .stock-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          padding: 4px 8px;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          background-color: rgba(0, 0, 0, 0.6);
          max-width: 62%;
          text-align: right;
        }

        .stock-badge.in-stock {
          color: #a7f3d0;
          border-left: 2px solid #10b981;
        }

        .stock-badge.pre-order {
          color: #fef08a;
          border-left: 2px solid #eab308;
        }

        /* Card Info */
        .card-info {
          padding: 24px;
        }

        .stone-type {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-accent-gold);
          margin-bottom: 8px;
          display: block;
        }

        .stone-name {
          font-size: 1.2rem;
          color: #ffffff;
          margin-bottom: 16px;
          font-weight: 400;
          font-family: var(--font-serif);
          white-space: normal;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          min-height: 2.6em;
          line-height: 1.3;
          word-break: break-word;
        }

        .stone-physical-property {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          margin: -4px 0 16px;
          padding: 10px 12px;
          background-color: rgba(197, 168, 128, 0.07);
          border-left: 2px solid var(--color-accent-gold);
          font-size: 0.72rem;
          color: var(--color-text-dark-muted);
        }

        .stone-physical-property strong {
          color: #ffffff;
          font-size: 0.78rem;
          font-weight: 500;
          text-align: right;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 16px;
        }

        .stone-price {
          font-size: 1.1rem;
          color: #ffffff;
          font-weight: 500;
        }

        .stone-price .currency {
          font-size: 0.8rem;
          color: var(--color-text-dark-muted);
          font-weight: 400;
        }

        .card-view-details {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-dark-muted);
          transition: var(--transition-fast);
        }

        .stone-card:hover .card-view-details {
          color: var(--color-accent-gold);
          transform: translateX(4px);
        }

        /* No Results */
        .no-results {
          text-align: center;
          padding: 80px 20px;
          border: 1px dashed rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .no-results h3 {
          font-size: 1.5rem;
          color: #ffffff;
        }

        .no-results p {
          color: var(--color-text-dark-muted);
          margin-bottom: 10px;
        }

        /* Mobile Drawer Filters */
        .mobile-filter-drawer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 2000;
          display: none;
        }

        .mobile-filter-drawer.open {
          display: block;
        }

        .drawer-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
        }

        .drawer-content {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          max-height: 80vh;
          background-color: var(--color-bg-dark);
          border-top: 1px solid var(--color-accent-gold-border);
          display: flex;
          flex-direction: column;
          z-index: 2001;
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          color: #ffffff;
        }

        .drawer-body {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .drawer-section h4 {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-accent-gold);
          margin-bottom: 12px;
        }

        .drawer-flex-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .drawer-option-btn {
          padding: 8px 16px;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.8rem;
          color: var(--color-text-dark-muted);
        }

        .drawer-option-btn.active {
          background-color: var(--color-accent-gold-light);
          border-color: var(--color-accent-gold);
          color: var(--color-accent-gold);
        }

        .drawer-footer {
          display: flex;
          gap: 15px;
          padding: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .btn-reset-mobile {
          flex: 1;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .btn-apply-mobile {
          flex: 2;
          padding: 14px;
          background-color: var(--color-accent-gold);
          color: #121212;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
