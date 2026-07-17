import React, { useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import { ArrowLeft, Check, Minimize2, Settings, PhoneCall } from 'lucide-react';
import { stonesData } from '../data/catalog';

interface StoneDetailProps {
  stoneId: string;
  setView: (view: 'hub' | 'catalog' | 'detail' | 'services', stoneId?: string | null) => void;
}

export const StoneDetail: React.FC<StoneDetailProps> = ({ stoneId, setView }) => {
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
        <button className="back-btn" onClick={() => setView('catalog')}>
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
              <img 
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
                <img src={stone.image} alt="" />
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
                    <div className="quote-product-options">
                      <button type="button" className={productType === 'countertop' ? 'active' : ''} onClick={() => setProductType('countertop')}>Столешница</button>
                      <button type="button" className={productType === 'wall-panel' ? 'active' : ''} onClick={() => setProductType('wall-panel')}>Панно</button>
                      <button type="button" className={productType === 'fireplace' ? 'active' : ''} onClick={() => setProductType('fireplace')}>Камин</button>
                      <button type="button" className={productType === 'stairs' ? 'active' : ''} onClick={() => setProductType('stairs')}>Ступени</button>
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

      <style>{`
        .detail-page {
          padding-top: 140px;
          padding-bottom: 80px;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-dark-muted);
          margin-bottom: 30px;
          transition: var(--transition-fast);
        }

        .back-btn:hover {
          color: var(--color-accent-gold);
          transform: translateX(-4px);
        }

        /* Detail Grid */
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 80px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        /* Gallery Column */
        .detail-gallery-col {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .zoom-image-container {
          position: relative;
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.05);
          overflow: hidden;
          cursor: zoom-in;
        }

        .main-image {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        .zoom-lens {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background-repeat: no-repeat;
        }

        .zoom-tip {
          position: absolute;
          bottom: 15px;
          right: 15px;
          background-color: rgba(0, 0, 0, 0.7);
          color: #ffffff;
          padding: 6px 12px;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 6px;
          pointer-events: none;
        }

        .detail-image-sub {
          font-size: 0.8rem;
          color: var(--color-text-dark-muted);
          text-align: center;
          font-style: italic;
        }

        /* Info Column */
        .detail-info-col {
          display: flex;
          flex-direction: column;
        }

        .info-rarity {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-accent-gold);
          margin-bottom: 12px;
        }

        .info-name {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          color: #ffffff;
          margin-bottom: 15px;
        }

        .info-price {
          font-size: 2rem;
          color: #ffffff;
          font-weight: 500;
          margin-bottom: 24px;
          font-family: var(--font-sans);
        }

        .info-price .currency {
          font-size: 1.1rem;
          color: var(--color-text-dark-muted);
          font-weight: 400;
        }

        .info-desc {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--color-text-dark-muted);
          margin-bottom: 40px;
          font-weight: 300;
          white-space: pre-wrap;
        }

        /* Specs Table */
        .specs-table-box {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 30px;
        }

        .specs-title {
          font-size: 1.1rem;
          color: #ffffff;
          margin-bottom: 20px;
        }

        .specs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .specs-table th, .specs-table td {
          padding: 12px 0;
          font-size: 0.88rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          text-align: left;
        }

        .specs-table th {
          color: var(--color-text-dark-muted);
          font-weight: 400;
          width: 40%;
        }

        .specs-table td {
          color: #ffffff;
        }

        .status-pill {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-pill.in-stock {
          color: #10b981;
        }

        .status-pill.pre-order {
          color: #eab308;
        }

        /* Individual quote section */
        .quote-section {
          padding-top: 40px;
        }

        .quote-card {
          display: grid;
          grid-template-columns: 0.82fr 1.18fr;
          background: linear-gradient(135deg, rgba(23, 24, 28, 0.98), rgba(17, 18, 21, 0.98));
          border: 1px solid rgba(197, 168, 128, 0.15);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        }

        .quote-intro,
        .quote-form-column {
          padding: 50px;
        }

        .quote-intro {
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .quote-eyebrow {
          color: var(--color-accent-gold);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .quote-title {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #ffffff;
          font-size: 1.75rem;
          margin: 14px 0 18px;
        }

        .quote-title-icon {
          color: var(--color-accent-gold);
          flex-shrink: 0;
        }

        .quote-description {
          color: var(--color-text-dark-muted);
          font-size: 0.86rem;
          line-height: 1.7;
        }

        .quote-stone-summary {
          display: grid;
          grid-template-columns: 72px 1fr;
          gap: 16px;
          align-items: center;
          margin: 30px 0;
          padding: 14px;
          background-color: rgba(0, 0, 0, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .quote-stone-summary img {
          width: 72px;
          height: 72px;
          object-fit: cover;
        }

        .quote-stone-summary div {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .quote-stone-summary span,
        .quote-stone-summary small {
          color: var(--color-text-dark-muted);
          font-size: 0.7rem;
        }

        .quote-stone-summary strong {
          color: #ffffff;
          font-size: 0.93rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .quote-factors {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .quote-factors li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: rgba(255, 255, 255, 0.82);
          font-size: 0.77rem;
          line-height: 1.45;
        }

        .quote-factors svg {
          color: var(--color-accent-gold);
          flex-shrink: 0;
          margin-top: 1px;
        }

        .quote-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .quote-form-title {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #ffffff;
          font-size: 1.1rem;
          margin-bottom: 2px;
        }

        .quote-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .quote-field label {
          color: var(--color-accent-gold);
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .quote-field input,
        .quote-field select,
        .quote-field textarea {
          width: 100%;
          padding: 12px 14px;
          color: #ffffff;
          font: inherit;
          font-size: 0.82rem;
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          outline: none;
          resize: vertical;
          transition: var(--transition-fast);
        }

        .quote-field input:focus,
        .quote-field select:focus,
        .quote-field textarea:focus {
          border-color: var(--color-accent-gold);
          box-shadow: 0 0 0 3px rgba(197, 168, 128, 0.07);
        }

        .quote-field select option {
          background-color: var(--color-bg-dark);
        }

        .quote-fields-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .quote-contact-row {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .quote-product-options {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .quote-product-options button {
          min-height: 42px;
          padding: 8px 10px;
          color: var(--color-text-dark-muted);
          font-size: 0.72rem;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: var(--transition-fast);
        }

        .quote-product-options button:hover,
        .quote-product-options button.active {
          color: var(--color-accent-gold);
          border-color: var(--color-accent-gold);
          background-color: rgba(197, 168, 128, 0.08);
        }

        .quote-form-note {
          color: var(--color-text-dark-muted);
          font-size: 0.68rem;
          line-height: 1.5;
          text-align: center;
        }

        .quote-form-column .lead-success {
          min-height: 100%;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .quote-card {
            grid-template-columns: 1fr;
          }

          .quote-intro {
            border-right: 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }
        }

        @media (max-width: 600px) {
          .quote-intro,
          .quote-form-column {
            padding: 32px 20px;
          }

          .quote-title {
            align-items: flex-start;
            font-size: 1.45rem;
          }

          .quote-fields-row,
          .quote-contact-row,
          .quote-product-options {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* Calculator Section */
        .calc-section {
          padding-top: 40px;
        }

        .calc-card {
          background-color: var(--color-bg-card-dark);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
        }

        .calc-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          min-height: 500px;
        }

        @media (max-width: 1024px) {
          .calc-grid {
            grid-template-columns: 1fr;
          }
        }

        .calc-params {
          padding: 50px;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        @media (max-width: 600px) {
          .calc-params {
            padding: 30px 20px;
          }
        }

        .calc-header-title {
          font-size: 1.5rem;
          color: #ffffff;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .calc-header-icon {
          color: var(--color-accent-gold);
        }

        .calc-header-desc {
          font-size: 0.85rem;
          color: var(--color-text-dark-muted);
          margin-top: -15px;
        }

        .param-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .param-group label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-accent-gold);
          font-weight: 500;
        }

        .param-options {
          display: flex;
          gap: 10px;
        }

        .flex-wrap {
          flex-wrap: wrap;
        }

        .grid-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 600px) {
          .grid-options {
            grid-template-columns: 1fr;
          }
        }

        .param-opt-btn {
          flex-grow: 1;
          padding: 12px 18px;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--color-text-dark-muted);
          font-size: 0.8rem;
          transition: var(--transition-fast);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .param-opt-btn:hover {
          border-color: rgba(197, 168, 128, 0.5);
          color: #ffffff;
        }

        .param-opt-btn.active {
          background-color: var(--color-accent-gold-light);
          border-color: var(--color-accent-gold);
          color: var(--color-accent-gold);
        }

        .param-opt-btn small {
          font-size: 0.65rem;
          opacity: 0.8;
        }

        .param-row-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .calc-num-input {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 16px;
          color: #ffffff;
          font-family: var(--font-sans);
          outline: none;
          font-size: 0.9rem;
        }

        .calc-num-input:focus {
          border-color: var(--color-accent-gold);
        }

        .calc-select {
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 16px;
          color: #ffffff;
          font-family: var(--font-sans);
          outline: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .calc-select option {
          background-color: var(--color-bg-dark);
        }

        /* Result Column */
        .calc-result {
          background-color: rgba(255, 255, 255, 0.01);
          padding: 50px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 40px;
        }

        @media (max-width: 1024px) {
          .calc-result {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }
        }

        @media (max-width: 600px) {
          .calc-result {
            padding: 30px 20px;
          }
        }

        .price-display-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .price-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-dark-muted);
        }

        .price-number {
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          color: #ffffff;
          font-family: var(--font-sans);
          font-weight: 600;
          line-height: 1;
        }

        .price-number .currency {
          font-size: 1.8rem;
          color: var(--color-accent-gold);
        }

        .price-details-footnote {
          font-size: 0.75rem;
          line-height: 1.5;
          color: var(--color-text-dark-muted);
          font-style: italic;
          margin-top: 10px;
        }

        /* Lead Form */
        .lead-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px;
        }

        .lead-form-title {
          font-size: 0.95rem;
          color: #ffffff;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lead-form-desc {
          font-size: 0.78rem;
          line-height: 1.4;
          color: var(--color-text-dark-muted);
          margin-top: -8px;
        }

        .lead-input {
          width: 100%;
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 16px;
          color: #ffffff;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          outline: none;
        }

        .lead-input:focus {
          border-color: var(--color-accent-gold);
        }

        .w-full {
          width: 100%;
        }

        /* Success screen */
        .lead-success {
          text-align: center;
          padding: 30px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .success-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid #10b981;
          color: #10b981;
        }

        .lead-success h4 {
          font-size: 1.25rem;
          color: #ffffff;
        }

        .lead-success p {
          font-size: 0.85rem;
          color: var(--color-text-dark-muted);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};
