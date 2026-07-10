import React, { useState, useRef } from 'react';
import type { MouseEvent } from 'react';
import { ArrowLeft, Check, Minimize2, Settings, PhoneCall } from 'lucide-react';
import { stonesData } from '../data/stones';

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
  const [finishing, setFinishing] = useState<string>(stone ? stone.finishing[0] : '');
  const [edgeProfile, setEdgeProfile] = useState<'classic' | 'half-bullnose' | 'full-bullnose' | 'ogee'>('classic');

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

  // Dynamic calculations
  const area = length * width;
  const perimeter = (length + width) * 2;
  
  const stonePrice = stone.price; // руб за м²
  const baseProductMultipliers = {
    'countertop': 1.15, // extra waste/cut overhead
    'fireplace': 1.4,
    'stairs': 1.25,
    'wall-panel': 1.1
  };

  const edgeProfilePrices = {
    'classic': 1500, // руб за п.м.
    'half-bullnose': 2500,
    'full-bullnose': 3500,
    'ogee': 5000
  };

  const calculatedStoneCost = area * stonePrice * baseProductMultipliers[productType];
  const calculatedEdgeCost = perimeter * edgeProfilePrices[edgeProfile];
  const installationCost = area * 5000 + 4000; // base install fee
  
  const totalCost = Math.round(calculatedStoneCost + calculatedEdgeCost + installationCost);

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
      totalCost
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
            <p className="detail-image-sub">Натуральная текстура камня. Фактический рисунок прожилок может отличаться.</p>
          </div>

          {/* Details & Specs Column */}
          <div className="detail-info-col">
            <span className="info-rarity">{(stone.rarity === 'Урал' || stone.rarity === 'Карелия') ? stone.rarity : `${stone.rarity} сорт`} &bull; {stone.origin}</span>
            <h1 className="info-name">{stone.name}</h1>
            <p className="info-price">
              {stone.isPriceFrom && 'от '}{stone.price.toLocaleString('ru-RU')} <span className="currency">₽ / м²</span>
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
                  <tr>
                    <th>Обработка поверхности</th>
                    <td>{stone.finishing.join(', ')}</td>
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

        {/* Product Interactive Calculator & Lead Form */}
        <section id="callback-form" className="calc-section">
          <div className="calc-card">
            <div className="calc-grid">
              
              {/* Left Side: Parameters */}
              <div className="calc-params">
                <h3 className="calc-header-title">
                  <Settings size={20} className="calc-header-icon" /> 
                  Рассчитать стоимость изделия
                </h3>
                <p className="calc-header-desc">Вы можете рассчитать предварительную стоимость готового изделия из этого камня.</p>
                
                <div className="param-group">
                  <label>Тип изделия</label>
                  <div className="param-options flex-wrap">
                    <button 
                      className={`param-opt-btn ${productType === 'countertop' ? 'active' : ''}`}
                      onClick={() => setProductType('countertop')}
                    >
                      Столешница / Остров
                    </button>
                    <button 
                      className={`param-opt-btn ${productType === 'wall-panel' ? 'active' : ''}`}
                      onClick={() => setProductType('wall-panel')}
                    >
                      Стеновое панно
                    </button>
                    <button 
                      className={`param-opt-btn ${productType === 'fireplace' ? 'active' : ''}`}
                      onClick={() => setProductType('fireplace')}
                    >
                      Облицовка камина
                    </button>
                    <button 
                      className={`param-opt-btn ${productType === 'stairs' ? 'active' : ''}`}
                      onClick={() => setProductType('stairs')}
                    >
                      Ступени
                    </button>
                  </div>
                </div>

                <div className="param-row-inputs">
                  <div className="param-group">
                    <label>Длина (м)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0.5" 
                      max="10" 
                      value={length} 
                      onChange={(e) => setLength(parseFloat(e.target.value) || 0.5)}
                      className="calc-num-input"
                    />
                  </div>
                  <div className="param-group">
                    <label>Ширина (м)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0.1" 
                      max="5" 
                      value={width} 
                      onChange={(e) => setWidth(parseFloat(e.target.value) || 0.1)}
                      className="calc-num-input"
                    />
                  </div>
                </div>

                <div className="param-row-inputs">
                  <div className="param-group">
                    <label>Толщина камня (плиты)</label>
                    <select 
                      value={thickness} 
                      onChange={(e) => setThickness(e.target.value)}
                      className="calc-select"
                    >
                      {stone.thickness.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="param-group">
                    <label>Тип обработки</label>
                    <select 
                      value={finishing} 
                      onChange={(e) => setFinishing(e.target.value)}
                      className="calc-select"
                    >
                      {stone.finishing.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="param-group">
                  <label>Профиль торца (Обработка кромки)</label>
                  <div className="param-options grid-options">
                    <button 
                      className={`param-opt-btn ${edgeProfile === 'classic' ? 'active' : ''}`}
                      onClick={() => setEdgeProfile('classic')}
                    >
                      <span>Классическая фаска (T)</span>
                      <small>+1 500 ₽/п.м.</small>
                    </button>
                    <button 
                      className={`param-opt-btn ${edgeProfile === 'half-bullnose' ? 'active' : ''}`}
                      onClick={() => setEdgeProfile('half-bullnose')}
                    >
                      <span>Полукруг (Half Bullnose)</span>
                      <small>+2 500 ₽/п.м.</small>
                    </button>
                    <button 
                      className={`param-opt-btn ${edgeProfile === 'full-bullnose' ? 'active' : ''}`}
                      onClick={() => setEdgeProfile('full-bullnose')}
                    >
                      <span>Полный круг (Full Bullnose)</span>
                      <small>+3 500 ₽/п.м.</small>
                    </button>
                    <button 
                      className={`param-opt-btn ${edgeProfile === 'ogee' ? 'active' : ''}`}
                      onClick={() => setEdgeProfile('ogee')}
                    >
                      <span>Фигурный Ogee (Классика)</span>
                      <small>+5 000 ₽/п.м.</small>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side: Lead Capture & Price Display */}
              <div className="calc-result">
                <div className="price-display-box">
                  <span className="price-label">Предварительный расчет изделия:</span>
                  <div className="price-number">
                    {totalCost.toLocaleString('ru-RU')} <span className="currency">₽</span>
                  </div>
                  <p className="price-details-footnote">
                    *Включает: раскрой материала ({area.toFixed(2)} м²), полировку торцов ({perimeter.toFixed(2)} п.м.), гидрорезку и базовую сборку. Доставка и финальный монтаж зависят от сложности объекта.
                  </p>
                </div>

                {!formSubmitted ? (
                  <form onSubmit={handleSubmitLead} className="lead-form">
                    <h4 className="lead-form-title">
                      <PhoneCall size={16} className="text-gold" /> Отправить расчет инженеру
                    </h4>
                    <p className="lead-form-desc">Зафиксируйте стоимость этого камня. Мы перезвоним для уточнения размеров и пригласим вас на просмотр камня.</p>
                    
                    <input 
                      type="text" 
                      placeholder="Имя" 
                      className="lead-input" 
                      value={userName} 
                      onChange={(e) => setUserName(e.target.value)} 
                      required 
                    />
                    <input 
                      type="tel" 
                      placeholder="Телефон (+7...)" 
                      className="lead-input" 
                      value={userPhone} 
                      onChange={(e) => setUserPhone(e.target.value)} 
                      required 
                    />
                    
                    <button type="submit" className="btn-gold-solid w-full">Отправить расчет</button>
                  </form>
                ) : (
                  <div className="lead-success">
                    <div className="success-icon">
                      <Check size={32} />
                    </div>
                    <h4>Расчет успешно отправлен!</h4>
                    <p>Наш технолог свяжется с вами в течение 15 минут по номеру <strong>{userPhone}</strong> для согласования чертежей.</p>
                    <button onClick={() => setFormSubmitted(false)} className="btn-gold">Сделать другой расчет</button>
                  </div>
                )}
              </div>

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
