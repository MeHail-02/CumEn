import React, { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { ArrowLeft, Check, Minimize2, Settings, PhoneCall } from 'lucide-react';
import { StoneImage } from './StoneImage';
import type { Navigate } from '../routing';
import { setPageMetadata } from '../utils/seo';
import { useCatalogStones } from '../hooks/useCatalogStones';
import '../styles/StoneDetail.css';

interface StoneDetailProps {
  stoneId: string;
  setView: Navigate;
}

export const StoneDetail: React.FC<StoneDetailProps> = ({ stoneId, setView }) => {
  const { stonesData, isLoading, error } = useCatalogStones();
  const stone = stonesData.find(s => s.id === stoneId);

  // Zoom effect logic
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });
  const imageRef = useRef<HTMLImageElement>(null);

  // Calculator state
  const [productType, setProductType] = useState<'countertop' | 'fireplace' | 'stairs' | 'wall-panel'>('countertop');
  const [length, setLength] = useState<number>(2.0); // в метрах
  const [width, setWidth] = useState<number>(0.6); // в метрах
  const [thickness, setThickness] = useState<string>(stone ? stone.thickness[0] : '');
  const [projectDetails, setProjectDetails] = useState('');

  // Lead form state
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (!stone) return;
    setPageMetadata({
      title: `${stone.name} — цена и характеристики | ATLAS STONE`,
      description: stone.description || `${stone.name}: происхождение, доступные толщины, наличие и расчет изделия.`,
      path: `/stone/${encodeURIComponent(stone.id)}`,
      image: stone.image,
    });
  }, [stone]);

  useEffect(() => {
    if (stone && !thickness) setThickness(stone.thickness[0] ?? '');
  }, [stone, thickness]);

  if (isLoading) return <div className="route-loading" role="status">Загружаем материал…</div>;
  if (error) return <div className="route-error" role="alert">Не удалось загрузить каталог. Обновите страницу и попробуйте снова.</div>;

  if (!stone) {
    return (
      <div className="container error-container">
        <h2>Материал не найден</h2>
        <button className="btn-gold" onClick={() => setView('catalog')}>Вернуться в каталог</button>
      </div>
    );
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const image = imageRef.current;
    if (!image) return;

    const { left, top, width, height } = image.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${stone.image})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%' // Zoom level
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleBackToCatalog = () => {
    const catalogOrigin = window.sessionStorage.getItem('atlas-detail-origin');
    if (catalogOrigin === stone.id && window.history.length > 1) {
      window.sessionStorage.removeItem('atlas-detail-origin');
      window.history.back();
      return;
    }
    setView('catalog');
  };

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone) return;

    // Simulate lead capture sending config
    console.log('Lead Captured:', {
      userName,
      userPhone,
      stone: stone.name,
      product: productType,
      dimensions: `${length}x${width}м`,
      thickness,
      details: projectDetails,
    });

    setFormSubmitted(true);
  };

  return (
    <div className="detail-page fade-in">
      <div className="container">
        {/* Back Link */}
        <button className="back-btn" onClick={handleBackToCatalog}>
          <ArrowLeft size={16} /> <span>Назад к каталогу</span>
        </button>

        {/* Core Detail Grid */}
        <div className="detail-grid">
          {/* Zoom Image Column */}
          <div className="detail-gallery-col">
            <div 
              className="zoom-image-container"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <StoneImage
                src={stone.image}
                alt={stone.name}
                ref={imageRef}
                className="main-image"
              />
              <div className="zoom-lens" style={zoomStyle} />
              <div className="zoom-tip">
                <Minimize2 size={14} /> Наведите для увеличения
              </div>
            </div>
          </div>

          {/* Details & Specs Column */}
          <div className="detail-info-col">
            <span className="info-rarity">{(stone.rarity === 'Импорт' || stone.rarity === 'Коллекционный') ? `${stone.rarity} сорт` : stone.rarity} &bull; {stone.origin}</span>
            <h1 className="info-name">{stone.name}</h1>
            <p className="info-price">
              {stone.price === 0 ? 'цена по запросу' : <>от {stone.price.toLocaleString('ru-RU')} <span className="currency">₽ / м²</span></>}
            </p>

            <p className="info-desc">{stone.description}</p>

            {/* Specifications Table */}
            <div className="specs-table-box">
              <h3 className="specs-title">Характеристики</h3>
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th>Тип камня</th>
                    <td>{stone.type}</td>
                  </tr>
                  <tr>
                    <th>Страна происхождения</th>
                    <td>{stone.origin}</td>
                  </tr>
                  <tr>
                    <th>Средний размер камня (плиты)</th>
                    <td>{stone.slabSize}</td>
                  </tr>
                  <tr>
                    <th>Доступная толщина</th>
                    <td>{stone.thickness.join(', ')}</td>
                  </tr>
                  {stone.density && (
                    <tr>
                      <th>Плотность</th>
                      <td>{stone.density}</td>
                    </tr>
                  )}
                  {stone.waterAbsorption && (
                    <tr>
                      <th>Водопоглощение</th>
                      <td>{stone.waterAbsorption}</td>
                    </tr>
                  )}
                  {stone.frostResistance && (
                    <tr>
                      <th>Морозостойкость</th>
                      <td>{stone.frostResistance}</td>
                    </tr>
                  )}
                  {stone.abrasion && (
                    <tr>
                      <th>Истираемость</th>
                      <td>{stone.abrasion}</td>
                    </tr>
                  )}
                  {stone.compressiveStrength && (
                    <tr>
                      <th>Предел прочности при сжатии</th>
                      <td>{stone.compressiveStrength}</td>
                    </tr>
                  )}
                  {stone.radiationClass && (
                    <tr>
                      <th>Радиационный класс</th>
                      <td>{stone.radiationClass}</td>
                    </tr>
                  )}
                  {stone.porosity && (
                    <tr>
                      <th>Пористость</th>
                      <td>{stone.porosity}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Статус наличия</th>
                    <td>
                      <span className={`status-pill ${stone.inStock ? 'in-stock' : 'pre-order'}`}>
                        {stone.inStock ? 'В наличии на складе' : 'Доступно под заказ'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Individual Product Quote */}
        <section id="callback-form" className="quote-section">
          <div className="quote-card">
            <div className="quote-intro">
              <span className="quote-eyebrow">Расчет по вашему проекту</span>
              <h3 className="quote-title">
                <Settings size={22} className="quote-title-icon" />
                Получить стоимость изделия
              </h3>
              <p className="quote-description">
                Итоговая цена зависит от выбранной партии камня, раскроя, обработки кромок, вырезов и условий монтажа. Оставьте параметры — технолог подготовит расчет по актуальным данным.
              </p>

              <div className="quote-stone-summary">
                <StoneImage src={stone.image} alt="" loading="lazy" />
                <div>
                  <span>Выбранный материал</span>
                  <strong>{stone.name}</strong>
                  <small>{stone.origin} · {stone.inStock ? 'в наличии' : 'под заказ'}</small>
                </div>
              </div>

              <ul className="quote-factors">
                <li><Check size={16} /> Проверим наличие нужного слэба и толщины</li>
                <li><Check size={16} /> Учтем обработку, вырезы, доставку и монтаж</li>
                <li><Check size={16} /> Согласуем расчет до начала работ</li>
              </ul>
            </div>

            <div className="quote-form-column">
              {!formSubmitted ? (
                <form onSubmit={handleSubmitLead} className="quote-form">
                  <h4 className="quote-form-title">
                    <PhoneCall size={17} className="text-gold" /> Параметры изделия
                  </h4>

                  <div className="quote-field">
                    <label>Тип изделия</label>
                    <div className="quote-product-options" role="group" aria-label="Тип изделия">
                      <button type="button" aria-pressed={productType === 'countertop'} className={productType === 'countertop' ? 'active' : ''} onClick={() => setProductType('countertop')}>Столешница</button>
                      <button type="button" aria-pressed={productType === 'wall-panel'} className={productType === 'wall-panel' ? 'active' : ''} onClick={() => setProductType('wall-panel')}>Панно</button>
                      <button type="button" aria-pressed={productType === 'fireplace'} className={productType === 'fireplace' ? 'active' : ''} onClick={() => setProductType('fireplace')}>Камин</button>
                      <button type="button" aria-pressed={productType === 'stairs'} className={productType === 'stairs' ? 'active' : ''} onClick={() => setProductType('stairs')}>Ступени</button>
                    </div>
                  </div>

                  <div className="quote-fields-row">
                    <div className="quote-field">
                      <label htmlFor="quote-length">Длина, м</label>
                      <input id="quote-length" type="number" step="0.1" min="0.1" max="20" value={length} onChange={(e) => setLength(parseFloat(e.target.value) || 0.1)} />
                    </div>
                    <div className="quote-field">
                      <label htmlFor="quote-width">Ширина, м</label>
                      <input id="quote-width" type="number" step="0.1" min="0.1" max="10" value={width} onChange={(e) => setWidth(parseFloat(e.target.value) || 0.1)} />
                    </div>
                    <div className="quote-field">
                      <label htmlFor="quote-thickness">Толщина</label>
                      <select id="quote-thickness" value={thickness} onChange={(e) => setThickness(e.target.value)}>
                        {stone.thickness.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="quote-fields-row quote-contact-row">
                    <div className="quote-field">
                      <label htmlFor="quote-name">Имя</label>
                      <input id="quote-name" type="text" placeholder="Ваше имя" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                    </div>
                    <div className="quote-field">
                      <label htmlFor="quote-phone">Телефон</label>
                      <input id="quote-phone" type="tel" placeholder="+7 (___) ___-__-__" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} required />
                    </div>
                  </div>

                  <div className="quote-field">
                    <label htmlFor="quote-details">Комментарий</label>
                    <textarea id="quote-details" rows={3} placeholder="Укажите количество деталей, вырезы, обработку кромки или другие пожелания" value={projectDetails} onChange={(e) => setProjectDetails(e.target.value)} />
                  </div>

                  <button type="submit" className="btn-gold-solid w-full">Запросить индивидуальный расчет</button>
                  <p className="quote-form-note">Точная стоимость формируется после уточнения чертежей и наличия материала.</p>
                </form>
              ) : (
                <div className="lead-success">
                  <div className="success-icon"><Check size={32} /></div>
                  <h4>Заявка принята</h4>
                  <p>Свяжемся с вами по номеру <strong>{userPhone}</strong>, уточним детали и подготовим расчет.</p>
                  <button onClick={() => setFormSubmitted(false)} className="btn-gold">Изменить параметры</button>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
