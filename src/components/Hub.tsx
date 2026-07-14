import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowRight, 
  Box, 
  Compass, 
  Cpu, 
  Sparkles, 
  ChevronRight, 
  RefreshCw,
  Layers,
  Flame,
  Droplets,
  UtensilsCrossed,
  X
} from 'lucide-react';
import { stonesData } from '../data/catalog';
import type { Stone } from '../data/stones';

interface HubProps {
  setView: (view: 'hub' | 'catalog' | 'detail' | 'services', stoneId?: string | null) => void;
}

interface PortfolioItem {
  id: number;
  title: string;
  location: string;
  category: 'countertops' | 'fireplaces' | 'walls' | 'stairs';
  image: string;
  description: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: 'Кухонный остров из кварцита Calacatta',
    location: 'Интерьер частного дома',
    category: 'countertops',
    image: '/23KGdEanRR2MznzETa_lzgaaDC-NB-nqxy3XqwfP_S-N5WGmmCZtMfkeB2Ml_p3DVxSG3-ODlpiACZvGndy2tujt.jpg',
    description: 'Массивный кухонный остров из элитного кварцита с перетеканием прожилок с горизонтальной плоскости на боковины. Лазерная ЧПУ-резка фасок.'
  },
  {
    id: 2,
    title: 'Облицовка камина камнем Calacatta Gold',
    location: 'Каминная зона',
    category: 'fireplaces',
    image: '/67duVkXQNG6hblROJ0SXlhXxeod1JvCP48C-JsnwtxvvtAYzkPXQ4WpPqCJQz_pevmqpJ2SbyWepO5P723I2AvoW.jpg',
    description: 'Каминный портал из цельного камня итальянского мрамора. Симметричный подбор рисунка прожилок, жаропрочная клеевая сборка.'
  },
  {
    id: 3,
    title: 'Ванная комната в едином камне Carrara',
    location: 'Ванная комната',
    category: 'walls',
    image: '/A6GOdjz6TX3_zN7hxqgbBlmVGGpIxjhpPF_ZqXknhoGk79GsqsqhRzT2JKzC3IRtUPv0PpDrJjgKHbDXYuKUMdDp.jpg',
    description: 'Облицовка стен ванной комнаты крупноформатным камнем каррарского мрамора с идеальным совпадением текстурных швов.'
  },
  {
    id: 4,
    title: 'Световое панно из оникса Emerald',
    location: 'Общественный интерьер',
    category: 'walls',
    image: '/KobXvYSB_0la3CgZu5EJqciXouQ_0dj6LOppHDZvcNOPhmhfE8nG3ENPxZX2s9QLjfAJuox3P4XjZ2CIWqHrusJh.jpg',
    description: 'Декоративная стена из полупрозрачного зеленого оникса со встроенной светодиодной подсветкой теплого спектра.'
  },
  {
    id: 5,
    title: 'Ступени из гранита Absolute Black',
    location: 'Входная группа',
    category: 'stairs',
    image: '/S2qiahutznH_yLGIu4pdpTe3807-lkHhtcp9hoczCuE0orM6ZOCGs7AvICuQDazX8UdbR3BKW-t1mdb2aVCl4Xm3.jpg',
    description: 'Износостойкая лестничная группа из черного индийского гранита. Термообработка поверхности для исключения скольжения.'
  },
  {
    id: 6,
    title: 'Облицовка стен «бабочкой» из мрамора',
    location: 'Гостиная частного дома',
    category: 'walls',
    image: '/Vb9oo3-T7VetACUO0tkcUBra62S4S1GINHGAREuRSN18Kqxp2tfkja3zC0irFUmgnhmNHPsVuMwoyWoeOV4L8VRm.jpg',
    description: 'Зеркальное панно (Bookmatch) из четырех камней Calacatta в интерьере гостиной.'
  },
  {
    id: 7,
    title: 'Кухонный остров из кварцита Patagonia',
    location: 'Кухня частного дома',
    category: 'countertops',
    image: '/XLMfG88_lma97yZEApZ6CQs2lmzJGt0atTmzkpbnTh2AsAkYygJ1uN0KZyqb44PwbUj9y-Ek9gzoQmIeYEwowZLs.jpg',
    description: 'Эксклюзивный кухонный остров из натурального кварцита Patagonia с выразительной текстурой.'
  },
  {
    id: 8,
    title: 'Каминный зал с облицовкой Calacatta Gold',
    location: 'Каминная зона',
    category: 'fireplaces',
    image: '/Xu7IjVfSZDiciekfaFKI_tTy_WJyH4oifiRoRb_Vae00ROrJj2dV85WhQrX2Lnab6oveSEXD2jl7-hmFeNPYE06l.jpg',
    description: 'Облицовка стен и портала камина премиальным мрамором Calacatta Gold с симметричной раскладкой рисунка.'
  },
  {
    id: 9,
    title: 'Ванная комната в едином камне Carrara White',
    location: 'Ванная комната',
    category: 'walls',
    image: '/dLa175nLC-wBLYnqodrOkRO_PbepBT6TdANZKoyQJZHOroe4RIdfn3oW9zM9VTwBhcy2Owwc95UtY6a_IQUhwu4Y.jpg',
    description: 'Роскошная отделка ванной комнаты плитами из белого каррарского мрамора.'
  },
  {
    id: 10,
    title: 'Мраморная лестница Calacatta',
    location: 'Загородная резиденция',
    category: 'stairs',
    image: '/RF3R1W_Q8PM80tODsfb4h8pAGUfhqVgCb1kaOcsEgIM1jBDKRHCKMA9YvUvkM_W9_RK7bNsfXB6fu-WVYI4EMYA2.jpg',
    description: 'Роскошная внутренняя лестница из белого мрамора с полированной отделкой. Сложные профили ступеней, бесшовная стыковка элементов и кованое ограждение.'
  },
  {
    id: 11,
    title: 'Облицовка фасада и колонн серым гранитом',
    location: 'Деловой центр',
    category: 'walls',
    image: '/RmPdbdYnkowiR5HIKJN4bNiLeS8OHk3swKFgPhLtB7pyEAZ3d-GOOVvdDyVbDdRKv1u506c84f85r_SJvaztv99Z.jpg',
    description: 'Проект вентилируемого фасада первого уровня коммерческого здания из серого гранита. Включает облицовку стен плитами с рустом, пилястры и цоколь.'
  },
  {
    id: 12,
    title: 'Входная группа со скульптурой льва',
    location: 'Бизнес-центр',
    category: 'walls',
    image: '/6XnjB2luts8Ohw8RAjvWfuJFWCXFMWFQKtlFcgYOhfjbcw4mNScuqLMYQ6R_PDijYaGWTSYHikLtsVy_ANMttx1b.jpg',
    description: 'Изготовление и установка классической скульптуры льва из светлого мрамора на гранитном постаменте перед главным входом в здание.'
  },
  {
    id: 13,
    title: 'Мощение входной зоны и облицовка портала',
    location: 'Офисный комплекс',
    category: 'stairs',
    image: '/c-PL41vcNbPYZR2cLPWZ_pbXAGrUfzwk9aoV-GhYAaIh6FUdtlaZ4KEjUuISnybXcSMbThBDrzYAkGR14RqVb7bj.jpg',
    description: 'Благоустройство входной группы: мощение площадки гранитной брусчаткой, облицовка входного портала цельными блоками гранита и гранитные цветочницы.'
  }
];

export const Hub: React.FC<HubProps> = ({ setView }) => {
  // Portfolio states
  const [lightboxProject, setLightboxProject] = useState<PortfolioItem | null>(null);

  // Quiz states
  const [quizStep, setQuizStep] = useState(1);
  const [quizUseCase, setQuizUseCase] = useState<string | null>(null);
  const [quizColorVibe, setQuizColorVibe] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<Stone | null>(null);

  // Featured stones subset
  const featuredStones = stonesData.filter(s => 
    ['absolute-black', 'koelga-marble', 'volga-blue-granite', 'granatovy-amfibolit-granite'].includes(s.id)
  );

  const startQuizAgain = () => {
    setQuizStep(1);
    setQuizUseCase(null);
    setQuizColorVibe(null);
    setQuizResult(null);
  };

  const handleUseCaseSelect = (useCase: string) => {
    setQuizUseCase(useCase);
    setQuizStep(2);
  };

  const handleColorVibeSelect = (vibe: string) => {
    setQuizColorVibe(vibe);
    
    // Determine matched stone
    const uCase = quizUseCase || 'countertop';
    let matchedId = 'koelga-marble';

    if (uCase === 'countertop') {
      if (vibe === 'light') matchedId = 'koelga-marble';
      else if (vibe === 'dark') matchedId = 'absolute-black';
      else matchedId = 'volga-blue-granite';
    } else if (uCase === 'wall') {
      if (vibe === 'light') matchedId = 'polotsky-marble';
      else if (vibe === 'dark') matchedId = 'gabbro-kupetsky-granite';
      else matchedId = 'granatovy-amfibolit-granite';
    } else if (uCase === 'fireplace') {
      if (vibe === 'light') matchedId = 'koelga-marble';
      else if (vibe === 'dark') matchedId = 'gabbro-diabase-granite';
      else matchedId = 'ala-noskua-granite';
    } else if (uCase === 'bathroom') {
      if (vibe === 'light') matchedId = 'polotsky-marble';
      else if (vibe === 'dark') matchedId = 'absolute-black';
      else matchedId = 'zheltau-5-granite';
    }

    const found = stonesData.find(s => s.id === matchedId) || stonesData[0];
    setQuizResult(found);
    setQuizStep(3);
  };

  return (
    <div className="hub-page fade-in">
      {/* 1. Hero Intro Section with Luxury Styling */}
      <section className="hero-intro">
        <div className="hero-grid-overlay" />
        <div className="container hero-content-wrapper">
          <div className="hero-badge animate-fade-in-down">
            <Sparkles size={14} className="hero-badge-icon" />
            <span>Натуральный камень · изготовление · монтаж</span>
          </div>
          
          <h1 className="hero-title animate-fade-in">
            Искусство, созданное <span className="gradient-text">природой</span>.<br />
            Раскрытое <span className="text-gold">мастерами</span>.
          </h1>
          
          <p className="hero-description animate-fade-in-up">
            ATLAS STONE помогает подобрать натуральный камень и создать изделие под конкретный интерьер. Сопровождаем проект от консультации и замера до обработки материала и монтажа готового изделия.
          </p>

          <div className="hero-actions animate-fade-in-up">
            <button className="btn-gold-solid hero-btn" onClick={() => setView('catalog')}>
              Исследовать галерею камней <ArrowRight size={16} />
            </button>
            <button className="btn-gold hero-btn" onClick={() => setView('services')}>
              Наше производство
            </button>
          </div>

          <div className="hero-scrolldown">
            <span className="scrolldown-text">Листайте вниз</span>
            <div className="scrolldown-mouse">
              <div className="scrolldown-wheel"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Gateways */}
      <section className="gateway-section">
        <div className="gateway-grid">
          {/* Gateway 1: Stone Catalog */}
          <div className="gateway-card" onClick={() => setView('catalog')}>
            <div 
              className="gateway-bg" 
              style={{ backgroundImage: 'url(/gateway-gallery.jpg)' }}
            />
            <div className="gateway-overlay" />
            <div className="gateway-content">
              <span className="gateway-tag">Каталог материалов</span>
              <h2 className="gateway-title">Галерея камня</h2>
              <p className="gateway-desc">
                Подбор мрамора и гранита по цвету, происхождению, фактуре и характеристикам для вашего проекта.
              </p>
              <span className="gateway-btn">
                Перейти в каталог <ArrowRight size={16} className="btn-arrow" />
              </span>
            </div>
            <div className="card-border-effect" />
          </div>

          {/* Gateway 2: Services / Production */}
          <div className="gateway-card" onClick={() => setView('services')}>
            <div 
              className="gateway-bg" 
              style={{ backgroundImage: 'url(/gateway-production.jpg)' }}
            />
            <div className="gateway-overlay" />
            <div className="gateway-content">
              <span className="gateway-tag">Изготовление под проект</span>
              <h2 className="gateway-title">Производство & Услуги</h2>
              <p className="gateway-desc">
                Высокоточное изготовление изделий любой сложности: столешницы, камины, лестницы, стеновые панели с подсветкой и монтаж.
              </p>
              <span className="gateway-btn">
                Смотреть услуги <ArrowRight size={16} className="btn-arrow" />
              </span>
            </div>
            <div className="card-border-effect" />
          </div>
        </div>
      </section>

      {/* Featured Rare Slabs Showcase */}
      <section className="featured-slabs-section">
        <div className="container">
          <div className="featured-flex-header">
            <div>
              <span className="section-tag">Коллекционные шедевры</span>
              <h2 className="section-title">Редкие сорта на складе</h2>
            </div>
            <button className="btn-gold" onClick={() => setView('catalog')}>
              Смотреть весь каталог ({stonesData.length} сортов)
            </button>
          </div>
          <div className="accent-line" style={{ margin: '20px 0 40px 0' }} />

          <div className="featured-stones-grid">
            {featuredStones.map((stone) => (
              <div 
                key={stone.id} 
                className="featured-stone-card"
                onClick={() => setView('detail', stone.id)}
              >
                <div className="stone-card-img-wrapper">
                  <img src={stone.image} alt={stone.name} className="stone-card-image" />
                  <div className="stone-card-badge">{stone.rarity}</div>
                  <div className="stone-card-hover-overlay">
                    <span className="hover-view-btn">
                      Посмотреть камень <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
                <div className="stone-card-info">
                  <div className="stone-card-meta">
                    <span className="stone-type">{stone.type}</span>
                    <span className="stone-origin">{stone.origin}</span>
                  </div>
                  <h3 className="stone-name">{stone.name}</h3>
                  <div className="stone-card-footer">
                    <span className="stone-price">от {stone.price.toLocaleString()} ₽/м²</span>
                    <span className="stone-more">Детали <ChevronRight size={14} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Stone Selector (Quiz) Widget */}
      <section className="quiz-selector-section">
        <div className="container">
          <div className="quiz-card-wrapper">
            <div className="quiz-info-block">
              <span className="section-tag">Умный ассистент</span>
              <h2 className="quiz-title-main">Индивидуальный подбор камня</h2>
              <p className="quiz-subtitle-main">
                Ответьте на 2 простых вопроса, и наш алгоритм подберет идеальный сорт камня под ваши задачи, учитывая его износостойкость, эстетику и особенности эксплуатации.
              </p>
              <div className="quiz-steps-indicators">
                <div className={`step-dot ${quizStep >= 1 ? 'active' : ''}`} />
                <div className={`step-dot ${quizStep >= 2 ? 'active' : ''}`} />
                <div className={`step-dot ${quizStep >= 3 ? 'active' : ''}`} />
              </div>
            </div>

            <div className="quiz-interactive-block">
              {quizStep === 1 && (
                <div className="quiz-step-content fade-in">
                  <h3 className="quiz-step-title">1. Где вы планируете использовать камень?</h3>
                  <div className="quiz-options-grid">
                    <button className="quiz-option-btn" onClick={() => handleUseCaseSelect('countertop')}>
                      <div className="option-icon-box"><UtensilsCrossed size={20} /></div>
                      <div className="option-texts">
                        <span className="option-title">Столешница / Кухонный остров</span>
                        <span className="option-desc">Требуется максимальная прочность и стойкость к кислотам</span>
                      </div>
                    </button>
                    
                    <button className="quiz-option-btn" onClick={() => handleUseCaseSelect('wall')}>
                      <div className="option-icon-box"><Layers size={20} /></div>
                      <div className="option-texts">
                        <span className="option-title">Настенное панно / Гостиная</span>
                        <span className="option-desc">Приоритет на красивый рисунок прожилок и масштабность</span>
                      </div>
                    </button>

                    <button className="quiz-option-btn" onClick={() => handleUseCaseSelect('fireplace')}>
                      <div className="option-icon-box"><Flame size={20} /></div>
                      <div className="option-texts">
                        <span className="option-title">Облицовка камина</span>
                        <span className="option-desc">Важна жаропрочность и благородный классический вид</span>
                      </div>
                    </button>

                    <button className="quiz-option-btn" onClick={() => handleUseCaseSelect('bathroom')}>
                      <div className="option-icon-box"><Droplets size={20} /></div>
                      <div className="option-texts">
                        <span className="option-title">Ванная комната</span>
                        <span className="option-desc">Необходима устойчивость к влаге и моющим средствам</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {quizStep === 2 && (
                <div className="quiz-step-content fade-in">
                  <h3 className="quiz-step-title">2. Какая цветовая и стилистическая гамма вам ближе?</h3>
                  <div className="quiz-options-grid">
                    <button className="quiz-option-btn" onClick={() => handleColorVibeSelect('light')}>
                      <div className="option-icon-box color-indicator light-color" />
                      <div className="option-texts">
                        <span className="option-title">Светлая и благородная</span>
                        <span className="option-desc">Белые, молочные, сливочные тона, визуально расширяющие комнату</span>
                      </div>
                    </button>

                    <button className="quiz-option-btn" onClick={() => handleColorVibeSelect('dark')}>
                      <div className="option-icon-box color-indicator dark-color" />
                      <div className="option-texts">
                        <span className="option-title">Темная и контрастная</span>
                        <span className="option-desc">Глубокие черные, темно-серые тона для создания камерного шика</span>
                      </div>
                    </button>

                    <button className="quiz-option-btn" onClick={() => handleColorVibeSelect('rich')}>
                      <div className="option-icon-box color-indicator rich-color" />
                      <div className="option-texts">
                        <span className="option-title">Редкие цветные акценты</span>
                        <span className="option-desc">Яркие природные узоры, экзотические текстуры и полудрагоценные цвета</span>
                      </div>
                    </button>
                  </div>
                  <button className="quiz-back-btn" onClick={() => setQuizStep(1)}>
                    Назад
                  </button>
                </div>
              )}

              {quizStep === 3 && quizResult && (
                <div className="quiz-step-content quiz-result-step fade-in">
                  <div className="result-header">
                    <span className="result-label">Ваша идеальная порода:</span>
                    <h3 className="result-stone-name">{quizResult.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dark-muted)', marginTop: '8px' }}>
                      Подобран для: {quizUseCase === 'countertop' ? 'Кухонной столешницы' : quizUseCase === 'wall' ? 'Стеновой панели' : quizUseCase === 'fireplace' ? 'Камина' : 'Ванной комнаты'} ({quizColorVibe === 'light' ? 'светлые тона' : quizColorVibe === 'dark' ? 'темные тона' : 'цветные акценты'})
                    </p>
                  </div>

                  <div className="result-stone-card">
                    <div className="result-stone-img">
                      <img src={quizResult.image} alt={quizResult.name} />
                    </div>
                    <div className="result-stone-details">
                      <div className="result-tags">
                        <span className="result-tag-pill">{quizResult.type}</span>
                        <span className="result-tag-pill">{quizResult.origin}</span>
                        <span className="result-tag-pill gold">{quizResult.rarity}</span>
                      </div>
                      <p className="result-stone-description">
                        {quizResult.description}
                      </p>
                      <div className="result-price">
                        Ориентировочная стоимость: <span className="price-val">от {quizResult.price.toLocaleString()} ₽/м²</span>
                      </div>
                    </div>
                  </div>

                  <div className="result-actions">
                    <button 
                      className="btn-gold-solid" 
                      onClick={() => setView('detail', quizResult.id)}
                    >
                      Подробнее о камне <ArrowRight size={14} />
                    </button>
                    <button 
                      className="quiz-reset-btn"
                      onClick={startQuizAgain}
                    >
                      <RefreshCw size={14} /> Подобрать другой
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ВСТРОЕННОЕ ПОРТФОЛИО УСЛУГ */}
      <section className="portfolio-masonry-section">
        <div className="container">
          <div className="section-title-wrap text-center">
            <span className="section-tag">Идеи и материалы</span>
            <h2 className="section-title">Камень в интерьере</h2>
            <div className="accent-line" />
          </div>

          {/* Grid gallery - Uniform Aspect Ratio, NO GAPS */}
          <div className="masonry-gallery">
            {portfolioItems.map(item => (
              <div 
                key={item.id} 
                className="masonry-gallery-item"
                onClick={() => setLightboxProject(item)}
              >
                <img src={item.image} alt={item.title} className="masonry-image" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal Popup */}
      {lightboxProject && createPortal(
        <div className="portfolio-lightbox" onClick={() => setLightboxProject(null)}>
          <div className="lightbox-content-image-only" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close-btn" onClick={() => setLightboxProject(null)}>
              <X size={20} />
            </button>
            <img src={lightboxProject.image} alt={lightboxProject.title} className="lightbox-only-image" />
          </div>
        </div>,
        document.body
      )}

      {/* Values / Philosophy Section */}
      <section className="philosophy-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Подход ATLAS STONE</span>
            <h2 className="section-title">От материала до готового изделия</h2>
            <div className="accent-line" />
          </div>

          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon-box">
                <Compass size={32} strokeWidth={1} />
              </div>
              <h3 className="value-title">Материал под задачу</h3>
              <p className="value-desc">
                Учитываем назначение изделия, нагрузку, условия эксплуатации, оттенок и природный рисунок камня.
              </p>
            </div>

            <div className="value-item">
              <div className="value-icon-box">
                <Cpu size={32} strokeWidth={1} />
              </div>
              <h3 className="value-title">Точный расчет</h3>
              <p className="value-desc">
                Фиксируем размеры, тип обработки, профиль кромки и особенности монтажа до начала изготовления.
              </p>
            </div>

            <div className="value-item">
              <div className="value-icon-box">
                <Box size={32} strokeWidth={1} />
              </div>
              <h3 className="value-title">Контроль результата</h3>
              <p className="value-desc">
                Согласовываем рисунок материала и детали изделия, чтобы готовое решение органично выглядело в интерьере.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Professional Counters / Metrics Section */}
      <section className="metrics-section">
        <div className="container">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-num text-gold">01</div>
              <div className="metric-label">Подбор материала</div>
              <p className="metric-desc">Помогаем выбрать камень по внешнему виду, свойствам и бюджету проекта</p>
            </div>

            <div className="metric-card">
              <div className="metric-num text-gold">02</div>
              <div className="metric-label">Замер и расчет</div>
              <p className="metric-desc">Уточняем геометрию, обработку кромок и технические особенности изделия</p>
            </div>

            <div className="metric-card">
              <div className="metric-num text-gold">03</div>
              <div className="metric-label">Изготовление</div>
              <p className="metric-desc">Выполняем раскрой и обработку материала по согласованным параметрам</p>
            </div>

            <div className="metric-card">
              <div className="metric-num text-gold">04</div>
              <div className="metric-label">Доставка и монтаж</div>
              <p className="metric-desc">Организуем установку готового изделия с учетом особенностей объекта</p>
            </div>
          </div>
        </div>
      </section>

      {/* Styles for Hub page */}
      <style>{`
        .hub-page {
          width: 100%;
        }

        /* Gradient & Typography Utilities */
        .gradient-text {
          background: linear-gradient(135deg, #ffffff 30%, var(--color-accent-gold) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Hero Section */
        .hero-intro {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 140px;
          padding-bottom: 100px;
          background: radial-gradient(circle at 80% 20%, rgba(197, 168, 128, 0.08) 0%, rgba(15, 16, 18, 0) 60%),
                      linear-gradient(180deg, rgba(15, 16, 18, 0.4) 0%, rgba(15, 16, 18, 0.95) 100%),
                      url('/hero-bg.jpg');
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }

        .hero-grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 80px 80px;
          background-position: center;
          pointer-events: none;
          z-index: 1;
        }

        .hero-content-wrapper {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background-color: rgba(197, 168, 128, 0.08);
          border: 1px solid rgba(197, 168, 128, 0.25);
          backdrop-filter: blur(8px);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-accent-gold);
          margin-bottom: 30px;
          border-radius: 40px;
        }

        .hero-badge-icon {
          animation: spin-slow 8s linear infinite;
        }

        .hero-title {
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          line-height: 1.1;
          margin-bottom: 25px;
          color: #ffffff;
          font-weight: 300;
        }

        .hero-description {
          max-width: 800px;
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--color-text-dark-muted);
          font-weight: 300;
          letter-spacing: 0.03em;
          margin-bottom: 45px;
        }

        .hero-actions {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 60px;
        }

        .hero-btn {
          min-width: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        @media (max-width: 600px) {
          .hero-intro {
            min-height: 100svh;
            padding-top: 120px;
            padding-bottom: 70px;
          }

          .hero-badge {
            max-width: 100%;
            justify-content: center;
            padding: 8px 12px;
            font-size: 0.62rem;
            line-height: 1.5;
            letter-spacing: 0.1em;
            text-align: center;
          }

          .hero-title {
            width: 100%;
            font-size: clamp(2.2rem, 11vw, 3rem);
          }

          .hero-description {
            width: 100%;
            margin-bottom: 32px;
            font-size: 0.9rem;
            line-height: 1.65;
          }

          .hero-actions {
            width: 100%;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 40px;
          }

          .hero-btn {
            width: 100%;
            min-width: 0;
          }
        }

        .hero-scrolldown {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          opacity: 0.7;
          transition: opacity 0.3s ease;
          cursor: pointer;
        }

        .hero-scrolldown:hover {
          opacity: 1;
        }

        .scrolldown-text {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: var(--color-text-dark-muted);
        }

        .scrolldown-mouse {
          width: 24px;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          position: relative;
        }

        .scrolldown-wheel {
          width: 4px;
          height: 8px;
          background-color: var(--color-accent-gold);
          border-radius: 2px;
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          animation: scroll-wheel 1.6s ease-out infinite;
        }

        /* Split Gateways Section */
        .gateway-section {
          padding: 0;
          margin-top: -1px; /* Align nicely with hero background */
        }

        .gateway-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 60vh;
          width: 100%;
          gap: 1px;
          background-color: rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 900px) {
          .gateway-grid {
            grid-template-columns: 1fr;
            min-height: auto;
          }
        }

        .gateway-card {
          position: relative;
          display: flex;
          align-items: flex-end;
          padding: 80px;
          cursor: pointer;
          overflow: hidden;
          transition: var(--transition-smooth);
        }

        @media (max-width: 600px) {
          .gateway-card {
            padding: 50px 24px;
          }
        }

        .gateway-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 1;
        }

        .gateway-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(15, 16, 18, 0.95) 15%, rgba(15, 16, 18, 0.6) 50%, rgba(15, 16, 18, 0.2) 100%);
          z-index: 2;
          transition: var(--transition-smooth);
        }

        .gateway-content {
          position: relative;
          z-index: 3;
          max-width: 500px;
          transform: translateY(15px);
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .gateway-tag {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-accent-gold);
          font-weight: 500;
          margin-bottom: 12px;
          display: block;
        }

        .gateway-title {
          font-size: 2.2rem;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .gateway-desc {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--color-text-dark-muted);
          margin-bottom: 24px;
          transition: color 0.3s ease;
        }

        .gateway-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-accent-gold);
          font-weight: 600;
        }

        .btn-arrow {
          transition: transform 0.3s ease;
        }

        .card-border-effect {
          position: absolute;
          top: 30px;
          left: 30px;
          right: 30px;
          bottom: 30px;
          border: 1px solid rgba(197, 168, 128, 0);
          pointer-events: none;
          z-index: 4;
          transition: var(--transition-smooth);
        }

        /* Hover interactions for gateways */
        .gateway-card:hover .gateway-bg {
          transform: scale(1.06);
        }

        .gateway-card:hover .gateway-overlay {
          background: linear-gradient(to top, rgba(15, 16, 18, 0.98) 15%, rgba(15, 16, 18, 0.7) 50%, rgba(15, 16, 18, 0.3) 100%);
        }

        .gateway-card:hover .gateway-content {
          transform: translateY(0);
        }

        .gateway-card:hover .gateway-desc {
          color: #ffffff;
        }

        .gateway-card:hover .btn-arrow {
          transform: translateX(6px);
        }

        .gateway-card:hover .card-border-effect {
          border-color: rgba(197, 168, 128, 0.2);
          top: 40px;
          left: 40px;
          right: 40px;
          bottom: 40px;
        }

        /* General Section Header styling */
        .section-header {
          max-width: 800px;
          margin: 0 auto 60px;
        }

        .section-tag {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--color-accent-gold);
          margin-bottom: 12px;
          display: block;
          font-weight: 500;
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          color: #ffffff;
          margin-bottom: 20px;
        }

        .section-subtitle-text {
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--color-text-dark-muted);
          font-weight: 300;
          margin-top: 15px;
        }

        .accent-line {
          width: 50px;
          height: 1px;
          background-color: var(--color-accent-gold);
          margin: 0 auto;
        }

        /* Featured Slabs Section */
        .featured-slabs-section {
          background-color: var(--color-bg-dark);
        }

        .featured-flex-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 20px;
        }

        .featured-stones-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
        }

        .featured-stone-card {
          background-color: var(--color-bg-card-dark);
          border: 1px solid rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: var(--transition-smooth);
          position: relative;
        }

        .featured-stone-card:hover {
          transform: translateY(-8px);
          border-color: var(--color-accent-gold-border);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
        }

        .stone-card-img-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          overflow: hidden;
        }

        .stone-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s ease;
        }

        .featured-stone-card:hover .stone-card-image {
          transform: scale(1.05);
        }

        .stone-card-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          padding: 4px 10px;
          background-color: rgba(197, 168, 128, 0.9);
          color: #121212;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          z-index: 2;
        }

        .stone-card-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 16, 18, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 3;
        }

        .featured-stone-card:hover .stone-card-hover-overlay {
          opacity: 1;
        }

        .hover-view-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background-color: #ffffff;
          color: #121212;
          padding: 8px 16px;
          font-weight: 500;
          transform: translateY(10px);
          transition: transform 0.3s ease;
        }

        .featured-stone-card:hover .hover-view-btn {
          transform: translateY(0);
        }

        .stone-card-info {
          padding: 24px;
        }

        .stone-card-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stone-type {
          color: var(--color-accent-gold);
          font-weight: 500;
        }

        .stone-origin {
          color: var(--color-text-dark-muted);
        }

        .stone-name {
          font-size: 1.15rem;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .stone-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 16px;
        }

        .stone-price {
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
        }

        .stone-more {
          font-size: 0.8rem;
          color: var(--color-accent-gold);
          display: flex;
          align-items: center;
          gap: 4px;
          transition: transform 0.3s ease;
        }

        .featured-stone-card:hover .stone-more {
          transform: translateX(4px);
        }

        /* Quiz Section */
        .quiz-selector-section {
          background-color: #121316;
        }

        .quiz-card-wrapper {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          border: 1px solid rgba(197, 168, 128, 0.15);
          background: linear-gradient(135deg, rgba(23, 24, 28, 0.8) 0%, rgba(15, 16, 18, 0.9) 100%);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 900px) {
          .quiz-card-wrapper {
            grid-template-columns: 1fr;
          }
        }

        .quiz-info-block {
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 900px) {
          .quiz-info-block {
            padding: 40px;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
        }

        .quiz-title-main {
          font-size: 2.2rem;
          color: #ffffff;
          margin-bottom: 20px;
        }

        .quiz-subtitle-main {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--color-text-dark-muted);
          font-weight: 300;
          margin-bottom: 40px;
        }

        .quiz-steps-indicators {
          display: flex;
          gap: 15px;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          transition: var(--transition-fast);
        }

        .step-dot.active {
          background-color: var(--color-accent-gold);
          box-shadow: 0 0 8px var(--color-accent-gold);
        }

        .quiz-interactive-block {
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 400px;
        }

        @media (max-width: 900px) {
          .quiz-interactive-block {
            padding: 40px;
            min-height: 350px;
          }
        }

        .quiz-step-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .quiz-step-title {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          color: #ffffff;
          margin-bottom: 10px;
        }

        .quiz-options-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .quiz-option-btn {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 20px;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          text-align: left;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .quiz-option-btn:hover {
          border-color: var(--color-accent-gold-border);
          background-color: rgba(255, 255, 255, 0.04);
        }

        .option-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: rgba(197, 168, 128, 0.1);
          color: var(--color-accent-gold);
          flex-shrink: 0;
        }

        .option-texts {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .option-title {
          font-size: 0.95rem;
          color: #ffffff;
          font-weight: 500;
        }

        .option-desc {
          font-size: 0.75rem;
          color: var(--color-text-dark-muted);
        }

        .quiz-back-btn {
          align-self: flex-start;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-text-dark-muted);
          cursor: pointer;
          transition: var(--transition-fast);
          margin-top: 10px;
        }

        .quiz-back-btn:hover {
          color: #ffffff;
        }

        /* Color Indicator icons in Quiz step 2 */
        .color-indicator {
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .light-color {
          background: linear-gradient(135deg, #ffffff, #e1dfda);
        }

        .dark-color {
          background: linear-gradient(135deg, #24252a, #0b0c0e);
        }

        .rich-color {
          background: linear-gradient(135deg, #c5a880, #385b73, #22513f);
        }

        /* Quiz Result formatting */
        .result-header {
          margin-bottom: 10px;
        }

        .result-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-accent-gold);
          display: block;
          margin-bottom: 6px;
        }

        .result-stone-name {
          font-size: 1.8rem;
          color: #ffffff;
        }

        .result-stone-card {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 20px;
        }

        @media (max-width: 600px) {
          .result-stone-card {
            grid-template-columns: 1fr;
          }
        }

        .result-stone-img {
          width: 100%;
          aspect-ratio: 1/1;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .result-stone-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .result-stone-details {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .result-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .result-tag-pill {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background-color: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          padding: 4px 8px;
        }

        .result-tag-pill.gold {
          background-color: rgba(197, 168, 128, 0.15);
          color: var(--color-accent-gold);
        }

        .result-stone-description {
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--color-text-dark-muted);
          font-weight: 300;
          white-space: pre-wrap;
        }

        .result-price {
          font-size: 0.85rem;
          color: #ffffff;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 12px;
          margin-top: auto;
        }

        .price-val {
          font-weight: 600;
          color: var(--color-accent-gold);
        }

        .result-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .quiz-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-text-dark-muted);
          transition: var(--transition-fast);
          cursor: pointer;
        }

        .quiz-reset-btn:hover {
          color: #ffffff;
        }

        /* Philosophy styling edits */
        .philosophy-section {
          background-color: var(--color-bg-dark);
          position: relative;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        @media (max-width: 900px) {
          .values-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        .value-item {
          text-align: center;
          padding: 40px 30px;
          border: 1px solid rgba(255, 255, 255, 0.02);
          background-color: rgba(23, 24, 28, 0.3);
          transition: var(--transition-smooth);
        }

        .value-item:hover {
          border-color: var(--color-accent-gold-border);
          background-color: rgba(23, 24, 28, 0.7);
          transform: translateY(-8px);
        }

        .value-icon-box {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 1px solid rgba(197, 168, 128, 0.15);
          color: var(--color-accent-gold);
          margin-bottom: 24px;
          background-color: rgba(197, 168, 128, 0.02);
          transition: var(--transition-smooth);
        }

        .value-item:hover .value-icon-box {
          border-color: var(--color-accent-gold);
          background-color: rgba(197, 168, 128, 0.06);
          box-shadow: 0 0 20px rgba(197, 168, 128, 0.15);
        }

        .value-title {
          font-size: 1.25rem;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .value-desc {
          font-size: 0.88rem;
          line-height: 1.7;
          color: var(--color-text-dark-muted);
          font-weight: 300;
        }

        /* Metrics / Counters Section */
        .metrics-section {
          background-color: #121316;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          padding: 80px 0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 30px;
        }

        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
          }
        }

        @media (max-width: 600px) {
          .metrics-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        .metric-card {
          text-align: center;
          padding: 20px;
        }

        .metric-num {
          font-family: var(--font-serif);
          font-size: clamp(2.5rem, 5vw, 3.6rem);
          line-height: 1;
          margin-bottom: 12px;
          font-weight: 300;
        }

        .metric-label {
          font-size: 0.95rem;
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-desc {
          font-size: 0.8rem;
          line-height: 1.5;
          color: var(--color-text-dark-muted);
          font-weight: 300;
        }

        /* Portfolio Grid & Lightbox Section */
        .portfolio-masonry-section {
          padding: 100px 0;
          background-color: var(--color-bg-dark);
        }

        .portfolio-tabs {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 40px;
          margin-bottom: 30px;
        }

        .portfolio-tab-btn {
          padding: 10px 20px;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .portfolio-tab-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.15);
        }

        .portfolio-tab-btn.active {
          background-color: var(--color-accent-gold);
          border-color: var(--color-accent-gold);
          color: #121212;
          font-weight: 600;
        }

        .masonry-gallery {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 30px;
        }

        @media (max-width: 900px) {
          .masonry-gallery {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .masonry-gallery {
            grid-template-columns: 1fr;
          }
        }

        .masonry-gallery-item {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 11;
          border: 1px solid rgba(255, 255, 255, 0.03);
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .masonry-gallery-item:hover {
          border-color: var(--color-accent-gold-border);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .masonry-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .masonry-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(15,16,18,0.95) 15%, rgba(15,16,18,0.3) 100%);
          opacity: 0;
          display: flex;
          align-items: flex-end;
          padding: 24px;
          transition: var(--transition-fast);
        }

        .masonry-gallery-item:hover .masonry-image {
          transform: scale(1.05);
        }

        .masonry-gallery-item:hover .masonry-overlay {
          opacity: 1;
        }

        .masonry-overlay-content {
          transform: translateY(15px);
          transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
          width: 100%;
        }

        .masonry-gallery-item:hover .masonry-overlay-content {
          transform: translateY(0);
        }

        .masonry-location {
          font-size: 0.7rem;
          color: var(--color-accent-gold);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
          display: block;
        }

        .masonry-title {
          font-size: 1.1rem;
          color: #ffffff;
          font-family: var(--font-serif);
          font-weight: 400;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .masonry-more-link {
          font-size: 0.75rem;
          color: var(--color-accent-gold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        /* Lightbox Modal CSS */
        .portfolio-lightbox {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(11, 12, 13, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeInOnly 0.3s ease-out;
        }

        .lightbox-content-image-only {
          position: relative;
          max-width: 90vw;
          max-height: 90vh;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          background-color: #0b0c0d;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .lightbox-only-image {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          display: block;
        }

        .lightbox-close-btn {
          position: absolute;
          top: 15px;
          right: 15px;
          color: rgba(255, 255, 255, 0.8);
          background-color: rgba(11, 12, 13, 0.5);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-fast);
          z-index: 10;
        }

        .lightbox-close-btn:hover {
          color: #ffffff;
          background-color: rgba(11, 12, 13, 0.8);
          transform: scale(1.05);
        }

        /* Keyframes Animations */
        @keyframes scroll-wheel {
          0% { top: 8px; opacity: 1; }
          50% { top: 22px; opacity: 0.3; }
          100% { top: 8px; opacity: 1; }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-glow {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(197, 168, 128, 0.3)); }
          100% { transform: scale(1.15); filter: drop-shadow(0 0 10px rgba(197, 168, 128, 0.8)); }
        }

        .animate-fade-in-down {
          animation: fadeInDown 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .animate-fade-in {
          animation: fadeInOnly 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeInOnly {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
