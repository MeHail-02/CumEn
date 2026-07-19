import React, { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowRight, 
  Box, 
  Compass, 
  Cpu, 
  Sparkles, 
  ChevronRight, 
  Layers,
  Flame,
  Droplets,
  UtensilsCrossed,
  ArrowLeft,
  RefreshCw,
  X,
  Send,
  CheckCircle
} from 'lucide-react';
import { CATALOG_TOTAL_COUNT, featuredStones, loadCatalogStones } from '../data/featuredStones';
import type { Stone } from '../data/stone';
import { StoneImage } from './StoneImage';
import { ConsentCheckboxes } from './ConsentCheckboxes';
import { createPath, type Navigate, type ViewState } from '../routing';
import { useModalDialog } from '../hooks/useModalDialog';
import { useLeadSubmission } from '../hooks/useLeadSubmission';
import '../styles/Hub.css';

interface HubProps {
  setView: Navigate;
}

type PortfolioCategory = 'cladding' | 'stairs' | 'floors' | 'monuments' | 'fireplaces';
type PortfolioFilter = 'all' | PortfolioCategory;
type QuizUseCase = 'countertop' | 'bathroom' | 'fireplace' | 'stairs' | 'wall' | 'outdoor';
type QuizPalette = 'any' | 'light' | 'dark' | 'warm' | 'green' | 'blue' | 'accent';
type QuizBudget = 'any' | 'value' | 'balanced' | 'premium';

interface PortfolioItem {
  id: number;
  category: PortfolioCategory;
  image: string;
}

const portfolioCategories: { id: PortfolioFilter; label: string }[] = [
  { id: 'all', label: 'Все работы' },
  { id: 'cladding', label: 'Панно и облицовка' },
  { id: 'stairs', label: 'Лестницы' },
  { id: 'floors', label: 'Полы и мощение' },
  { id: 'monuments', label: 'Памятники и скульптуры' },
  { id: 'fireplaces', label: 'Камины' },
];

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    category: 'stairs',
    image: '/23KGdEanRR2MznzETa_lzgaaDC-NB-nqxy3XqwfP_S-N5WGmmCZtMfkeB2Ml_p3DVxSG3-ODlpiACZvGndy2tujt.jpg',
  },
  {
    id: 2,
    category: 'floors',
    image: '/67duVkXQNG6hblROJ0SXlhXxeod1JvCP48C-JsnwtxvvtAYzkPXQ4WpPqCJQz_pevmqpJ2SbyWepO5P723I2AvoW.jpg',
  },
  {
    id: 3,
    category: 'cladding',
    image: '/A6GOdjz6TX3_zN7hxqgbBlmVGGpIxjhpPF_ZqXknhoGk79GsqsqhRzT2JKzC3IRtUPv0PpDrJjgKHbDXYuKUMdDp.jpg',
  },
  {
    id: 4,
    category: 'cladding',
    image: '/KobXvYSB_0la3CgZu5EJqciXouQ_0dj6LOppHDZvcNOPhmhfE8nG3ENPxZX2s9QLjfAJuox3P4XjZ2CIWqHrusJh.jpg',
  },
  {
    id: 5,
    category: 'stairs',
    image: '/S2qiahutznH_yLGIu4pdpTe3807-lkHhtcp9hoczCuE0orM6ZOCGs7AvICuQDazX8UdbR3BKW-t1mdb2aVCl4Xm3.jpg',
  },
  {
    id: 6,
    category: 'floors',
    image: '/Vb9oo3-T7VetACUO0tkcUBra62S4S1GINHGAREuRSN18Kqxp2tfkja3zC0irFUmgnhmNHPsVuMwoyWoeOV4L8VRm.jpg',
  },
  {
    id: 7,
    category: 'floors',
    image: '/XLMfG88_lma97yZEApZ6CQs2lmzJGt0atTmzkpbnTh2AsAkYygJ1uN0KZyqb44PwbUj9y-Ek9gzoQmIeYEwowZLs.jpg',
  },
  {
    id: 8,
    category: 'monuments',
    image: '/Xu7IjVfSZDiciekfaFKI_tTy_WJyH4oifiRoRb_Vae00ROrJj2dV85WhQrX2Lnab6oveSEXD2jl7-hmFeNPYE06l.jpg',
  },
  {
    id: 9,
    category: 'floors',
    image: '/dLa175nLC-wBLYnqodrOkRO_PbepBT6TdANZKoyQJZHOroe4RIdfn3oW9zM9VTwBhcy2Owwc95UtY6a_IQUhwu4Y.jpg',
  },
  {
    id: 10,
    category: 'stairs',
    image: '/RF3R1W_Q8PM80tODsfb4h8pAGUfhqVgCb1kaOcsEgIM1jBDKRHCKMA9YvUvkM_W9_RK7bNsfXB6fu-WVYI4EMYA2.jpg',
  },
  {
    id: 11,
    category: 'cladding',
    image: '/RmPdbdYnkowiR5HIKJN4bNiLeS8OHk3swKFgPhLtB7pyEAZ3d-GOOVvdDyVbDdRKv1u506c84f85r_SJvaztv99Z.jpg',
  },
  {
    id: 12,
    category: 'monuments',
    image: '/6XnjB2luts8Ohw8RAjvWfuJFWCXFMWFQKtlFcgYOhfjbcw4mNScuqLMYQ6R_PDijYaGWTSYHikLtsVy_ANMttx1b.jpg',
  },
  {
    id: 13,
    category: 'cladding',
    image: '/c-PL41vcNbPYZR2cLPWZ_pbXAGrUfzwk9aoV-GhYAaIh6FUdtlaZ4KEjUuISnybXcSMbThBDrzYAkGR14RqVb7bj.jpg',
  },
  {
    id: 14,
    category: 'fireplaces',
    image: '/portfolio-fireplace-classic.jpg',
  },
  {
    id: 15,
    category: 'cladding',
    image: '/portfolio-stone-wall-installation.jpg',
  },
  {
    id: 16,
    category: 'stairs',
    image: '/portfolio/marble-staircase-landing.jpg',
  },
  {
    id: 17,
    category: 'floors',
    image: '/portfolio/marble-bathroom-vanity.jpg',
  },
  {
    id: 18,
    category: 'stairs',
    image: '/portfolio/curved-marble-staircase.jpg',
  },
  {
    id: 19,
    category: 'cladding',
    image: '/portfolio/marble-bathroom-doorway.jpg',
  },
  {
    id: 20,
    category: 'cladding',
    image: '/portfolio/marble-bathroom-panels.jpg',
  },
  {
    id: 21,
    category: 'stairs',
    image: '/portfolio/spiral-marble-staircase.jpg',
  },
  {
    id: 22,
    category: 'floors',
    image: '/portfolio/marble-bathroom-floor.jpg',
  },
  {
    id: 23,
    category: 'stairs',
    image: '/portfolio/marble-staircase-balustrade.jpg',
  },
  {
    id: 24,
    category: 'cladding',
    image: '/portfolio/marble-wall-panels.jpg',
  },
];

const quizStoneTypes: Record<QuizUseCase, Stone['type'][]> = {
  countertop: ['кварцит', 'гранит', 'лабрадорит', 'мрамор'],
  bathroom: ['мрамор', 'кварцит', 'гранит', 'оникс', 'травертин'],
  fireplace: ['мрамор', 'гранит', 'кварцит', 'травертин', 'оникс'],
  stairs: ['гранит', 'мрамор', 'кварцит', 'травертин'],
  wall: ['мрамор', 'оникс', 'кварцит', 'травертин', 'гранит'],
  outdoor: ['гранит', 'кварцит', 'травертин', 'лабрадорит'],
};

const quizPaletteColors: Record<QuizPalette, string[]> = {
  any: [],
  light: ['белый', 'бежевый', 'серый'],
  dark: ['черный', 'серый', 'коричневый'],
  warm: ['бежевый', 'коричневый', 'желтый'],
  green: ['зеленый'],
  blue: ['синий'],
  accent: ['красный', 'розовый', 'желтый', 'зеленый', 'синий'],
};

const quizUseCaseLabels: Record<QuizUseCase, string> = {
  countertop: 'столешница или остров',
  bathroom: 'ванная комната',
  fireplace: 'камин',
  stairs: 'ступени или пол',
  wall: 'панно или облицовка',
  outdoor: 'фасад или улица',
};

export const Hub: React.FC<HubProps> = ({ setView }) => {
  // Portfolio states
  const [lightboxProject, setLightboxProject] = useState<PortfolioItem | null>(null);
  const [portfolioFilter, setPortfolioFilter] = useState<PortfolioFilter>('all');

  const filteredPortfolioItems = portfolioFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter((item) => item.category === portfolioFilter);

  // Stone selection assistant states
  const [quizStep, setQuizStep] = useState<1 | 2 | 3 | 4>(1);
  const [quizUseCase, setQuizUseCase] = useState<QuizUseCase | null>(null);
  const [quizPalette, setQuizPalette] = useState<QuizPalette | null>(null);
  const [quizBudget, setQuizBudget] = useState<QuizBudget | null>(null);
  const [quizResults, setQuizResults] = useState<Stone[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);

  // Product quote form states
  const [quoteName, setQuoteName] = useState('');
  const [quotePhone, setQuotePhone] = useState('');
  const [quoteProduct, setQuoteProduct] = useState('');
  const [quoteDetails, setQuoteDetails] = useState('');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quotePolicyAccepted, setQuotePolicyAccepted] = useState(false);
  const [quoteConsentAccepted, setQuoteConsentAccepted] = useState(false);
  const quoteSubmission = useLeadSubmission();

  const handleInternalLink = (
    event: React.MouseEvent<HTMLAnchorElement>,
    view: ViewState,
    stoneId: string | null = null,
  ) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setView(view, stoneId);
  };

  const closeLightbox = useCallback(() => setLightboxProject(null), []);
  const lightboxRef = useModalDialog<HTMLDivElement>(Boolean(lightboxProject), closeLightbox);

  const getQuizMatches = (stones: Stone[], useCase: QuizUseCase, palette: QuizPalette, budget: QuizBudget) => {
    const preferredTypes = quizStoneTypes[useCase];
    const preferredColors = quizPaletteColors[palette];

    const matchesPalette = (stone: Stone) => {
      if (preferredColors.length === 0) return true;
      const colors = Array.isArray(stone.color) ? stone.color : [stone.color];
      return colors.some((color) => preferredColors.includes(color));
    };

    const matchesBudget = (stone: Stone) => {
      if (budget === 'any') return true;
      if (stone.price <= 0) return false;
      if (budget === 'value') return stone.price <= 15000;
      if (budget === 'balanced') return stone.price > 15000 && stone.price <= 50000;
      return stone.price > 50000;
    };

    return stones
      .filter((stone) => preferredTypes.includes(stone.type) && matchesPalette(stone) && matchesBudget(stone))
      .sort((first, second) => {
        if (first.inStock !== second.inStock) return first.inStock ? -1 : 1;
        const typeDifference = preferredTypes.indexOf(first.type) - preferredTypes.indexOf(second.type);
        if (typeDifference !== 0) return typeDifference;
        if (budget === 'premium') return second.price - first.price;
        if (first.price === 0) return 1;
        if (second.price === 0) return -1;
        return first.price - second.price;
      })
      .slice(0, 6);
  };

  const handleUseCaseSelect = (useCase: QuizUseCase) => {
    setQuizUseCase(useCase);
    setQuizStep(2);
    void loadCatalogStones();
  };

  const handlePaletteSelect = (palette: QuizPalette) => {
    setQuizPalette(palette);
    setQuizStep(3);
  };

  const handleBudgetSelect = async (budget: QuizBudget) => {
    if (!quizUseCase || !quizPalette) return;
    setQuizBudget(budget);
    setQuizLoading(true);
    try {
      const stones = await loadCatalogStones();
      setQuizResults(getQuizMatches(stones, quizUseCase, quizPalette, budget));
      setQuizStep(4);
    } finally {
      setQuizLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuizStep(1);
    setQuizUseCase(null);
    setQuizPalette(null);
    setQuizBudget(null);
    setQuizResults([]);
  };

  const handleProductQuoteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quoteName || !quotePhone || !quoteProduct || !quotePolicyAccepted || !quoteConsentAccepted) return;

    const formData = new FormData(event.currentTarget);
    const sent = await quoteSubmission.send({
      formType: 'product_quote',
      name: quoteName,
      phone: quotePhone,
      product: quoteProduct,
      details: quoteDetails,
      policyAccepted: quotePolicyAccepted,
      consentAccepted: quoteConsentAccepted,
      website: String(formData.get('website') ?? ''),
    }, 'product_quote_sent');
    if (sent) setQuoteSubmitted(true);
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
              Услуги по монтажу
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
          <a className="gateway-card" href={createPath('catalog')} onClick={(event) => handleInternalLink(event, 'catalog')}>
            <div 
              className="gateway-bg" 
              style={{ backgroundImage: 'url(/gateway-gallery-quarry.webp)' }}
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
          </a>

          {/* Gateway 2: Services / Production */}
          <a className="gateway-card" href={createPath('services')} onClick={(event) => handleInternalLink(event, 'services')}>
            <div 
              className="gateway-bg" 
              style={{ backgroundImage: 'url(/service-installation.webp)' }}
            />
            <div className="gateway-overlay" />
            <div className="gateway-content">
              <span className="gateway-tag">Изготовление под проект</span>
              <h2 className="gateway-title">Услуги по монтажу</h2>
              <p className="gateway-desc">
                Высокоточное изготовление изделий любой сложности: столешницы, камины, лестницы, стеновые панели с подсветкой и монтаж.
              </p>
              <span className="gateway-btn">
                Смотреть услуги <ArrowRight size={16} className="btn-arrow" />
              </span>
            </div>
            <div className="card-border-effect" />
          </a>
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
              Смотреть весь каталог ({CATALOG_TOTAL_COUNT} сортов)
            </button>
          </div>
          <div className="accent-line" style={{ margin: '20px 0 40px 0' }} />

          <div className="featured-stones-grid">
            {featuredStones.map((stone) => (
              <a
                key={stone.id}
                className="featured-stone-card"
                href={createPath('detail', stone.id)}
                onClick={(event) => handleInternalLink(event, 'detail', stone.id)}
              >
                <div className="stone-card-img-wrapper">
                  <StoneImage src={stone.image} alt={stone.name} className="stone-card-image" loading="lazy" />
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
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Interactive Stone Selector */}
      <section className="stone-selector-section">
        <div className="container">
          <div className={`stone-selector-card ${quizStep === 4 ? 'showing-results' : ''}`}>
            <div className="selector-intro">
              <span className="section-tag">Помощник по каталогу</span>
              <h2 className="selector-title">Подберите камень под вашу задачу</h2>
              <p className="selector-description">
                Укажите назначение, желаемую палитру и бюджет. Мы отберем несколько подходящих вариантов из актуального каталога с учетом свойств породы и наличия.
              </p>

              <div className="selector-progress" aria-label={`Шаг ${Math.min(quizStep, 3)} из 3`}>
                {[1, 2, 3].map((step) => (
                  <span key={step} className={quizStep >= step ? 'active' : ''} />
                ))}
                <small>{quizStep === 4 ? 'Подбор готов' : `Шаг ${quizStep} из 3`}</small>
              </div>

              {(quizUseCase || quizPalette || quizBudget) && (
                <div className="selector-selections">
                  {quizUseCase && <span>{quizUseCaseLabels[quizUseCase]}</span>}
                  {quizPalette && <span>{quizPalette === 'any' ? 'любой цвет' : `палитра: ${quizPalette === 'light' ? 'светлая' : quizPalette === 'dark' ? 'темная' : quizPalette === 'warm' ? 'теплая' : quizPalette === 'green' ? 'зеленая' : quizPalette === 'blue' ? 'синяя' : 'акцентная'}`}</span>}
                  {quizBudget && <span>{quizBudget === 'any' ? 'любой бюджет' : quizBudget === 'value' ? 'до 15 000 ₽/м²' : quizBudget === 'balanced' ? '15 000–50 000 ₽/м²' : 'от 50 000 ₽/м²'}</span>}
                </div>
              )}
            </div>

            <div className="selector-interactive">
              {quizStep === 1 && (
                <div className="selector-step fade-in">
                  <div className="selector-step-heading">
                    <span>01</span>
                    <h3>Где будет использоваться камень?</h3>
                  </div>
                  <div className="selector-options-grid use-case-options">
                    <button type="button" className="selector-option" onClick={() => handleUseCaseSelect('countertop')}>
                      <span className="selector-option-icon"><UtensilsCrossed size={19} /></span>
                      <span><strong>Столешница / остров</strong><small>Кухня, барная зона, рабочая поверхность</small></span>
                      <ChevronRight size={17} />
                    </button>
                    <button type="button" className="selector-option" onClick={() => handleUseCaseSelect('bathroom')}>
                      <span className="selector-option-icon"><Droplets size={19} /></span>
                      <span><strong>Ванная комната</strong><small>Столешница, стены, душевая зона</small></span>
                      <ChevronRight size={17} />
                    </button>
                    <button type="button" className="selector-option" onClick={() => handleUseCaseSelect('fireplace')}>
                      <span className="selector-option-icon"><Flame size={19} /></span>
                      <span><strong>Облицовка камина</strong><small>Портал или декоративная композиция</small></span>
                      <ChevronRight size={17} />
                    </button>
                    <button type="button" className="selector-option" onClick={() => handleUseCaseSelect('stairs')}>
                      <span className="selector-option-icon"><Box size={19} /></span>
                      <span><strong>Ступени / пол</strong><small>Поверхности с регулярной нагрузкой</small></span>
                      <ChevronRight size={17} />
                    </button>
                    <button type="button" className="selector-option" onClick={() => handleUseCaseSelect('wall')}>
                      <span className="selector-option-icon"><Layers size={19} /></span>
                      <span><strong>Панно / облицовка</strong><small>Акцентная стена, колонны, интерьер</small></span>
                      <ChevronRight size={17} />
                    </button>
                    <button type="button" className="selector-option" onClick={() => handleUseCaseSelect('outdoor')}>
                      <span className="selector-option-icon"><Compass size={19} /></span>
                      <span><strong>Фасад / улица</strong><small>Цоколь, крыльцо, мощение, экстерьер</small></span>
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}

              {quizStep === 2 && (
                <div className="selector-step fade-in">
                  <div className="selector-step-heading">
                    <span>02</span>
                    <h3>Какая палитра вам ближе?</h3>
                  </div>
                  <div className="selector-options-grid palette-options">
                    {([
                      ['any', 'Любой цвет', 'Покажем максимум вариантов'],
                      ['light', 'Светлая', 'Белые, бежевые и светло-серые'],
                      ['dark', 'Темная', 'Черные, графитовые и коричневые'],
                      ['warm', 'Теплая', 'Песочные, медовые и кофейные'],
                      ['green', 'Зеленая', 'От оливкового до изумрудного'],
                      ['blue', 'Синяя', 'Голубые и глубокие синие'],
                      ['accent', 'Цветной акцент', 'Редкие выразительные оттенки'],
                    ] as [QuizPalette, string, string][]).map(([value, title, description]) => (
                      <button key={value} type="button" className="selector-option palette-option" onClick={() => handlePaletteSelect(value)}>
                        <span className={`palette-swatch ${value}`} />
                        <span><strong>{title}</strong><small>{description}</small></span>
                        <ChevronRight size={17} />
                      </button>
                    ))}
                  </div>
                  <button type="button" className="selector-back" onClick={() => setQuizStep(1)}><ArrowLeft size={15} /> Назад</button>
                </div>
              )}

              {quizStep === 3 && (
                <div className="selector-step fade-in">
                  <div className="selector-step-heading">
                    <span>03</span>
                    <h3>На какой бюджет по материалу ориентироваться?</h3>
                  </div>
                  <div className="selector-options-grid budget-options">
                    <button type="button" className="selector-option budget-option" disabled={quizLoading} onClick={() => void handleBudgetSelect('any')}><span><strong>Бюджет не определен</strong><small>Покажем варианты разных ценовых категорий</small></span><ChevronRight size={17} /></button>
                    <button type="button" className="selector-option budget-option" disabled={quizLoading} onClick={() => void handleBudgetSelect('value')}><span><strong>До 15 000 ₽/м²</strong><small>Практичные решения и российские породы</small></span><ChevronRight size={17} /></button>
                    <button type="button" className="selector-option budget-option" disabled={quizLoading} onClick={() => void handleBudgetSelect('balanced')}><span><strong>15 000–50 000 ₽/м²</strong><small>Широкий выбор импортных материалов</small></span><ChevronRight size={17} /></button>
                    <button type="button" className="selector-option budget-option" disabled={quizLoading} onClick={() => void handleBudgetSelect('premium')}><span><strong>От 50 000 ₽/м²</strong><small>Редкие и коллекционные сорта</small></span><ChevronRight size={17} /></button>
                  </div>
                  <button type="button" className="selector-back" onClick={() => setQuizStep(2)}><ArrowLeft size={15} /> Назад</button>
                </div>
              )}

              {quizStep === 4 && (
                <div className="selector-step selector-results fade-in">
                  <div className="selector-results-heading">
                    <div>
                      <span className="section-tag">Подходящие варианты</span>
                      <h3>{quizResults.length > 0 ? `Нашли ${quizResults.length} материалов` : 'Точных совпадений нет'}</h3>
                    </div>
                    <button type="button" className="selector-reset" onClick={resetQuiz}><RefreshCw size={15} /> Изменить параметры</button>
                  </div>

                  {quizResults.length > 0 ? (
                    <div className="selector-results-grid">
                      {quizResults.map((stone) => (
                        <button key={stone.id} type="button" className="selector-result-card" onClick={() => setView('detail', stone.id)}>
                          <StoneImage src={stone.image} alt="" loading="lazy" />
                          <span className="selector-result-content">
                            <small>{stone.type} · {stone.origin}</small>
                            <strong>{stone.name}</strong>
                            <span>{stone.price > 0 ? `от ${stone.price.toLocaleString('ru-RU')} ₽/м²` : 'Цена по запросу'} <ChevronRight size={15} /></span>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="selector-empty-result">
                      <p>Попробуйте расширить бюджет или выбрать вариант «Любой цвет». Специалист также может подобрать материал вручную.</p>
                    </div>
                  )}

                  <div className="selector-result-actions">
                    <button type="button" className="btn-gold" onClick={() => setView('catalog')}>Смотреть весь каталог</button>
                    <a href="#callback-form">Запросить подбор специалистом</a>
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
            <span className="section-tag">Реализованные проекты</span>
            <h2 className="section-title">Портфолио работ</h2>
            <div className="accent-line" />
            <p className="portfolio-intro">
              Выберите категорию, чтобы посмотреть интересующий тип изделий и отделки.
            </p>
          </div>

          <div className="portfolio-tabs" role="group" aria-label="Категории портфолио">
            {portfolioCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={portfolioFilter === category.id}
                className={`portfolio-tab-btn ${portfolioFilter === category.id ? 'active' : ''}`}
                onClick={() => setPortfolioFilter(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <p className="portfolio-mobile-hint" aria-hidden="true">
            {filteredPortfolioItems.length} фото · листайте вбок →
          </p>

          <div className="masonry-gallery" aria-live="polite">
            {filteredPortfolioItems.map(item => (
              <button
                type="button"
                key={item.id} 
                className="masonry-gallery-item"
                onClick={() => setLightboxProject(item)}
                aria-label={`Открыть фотографию из портфолио, номер ${item.id}`}
              >
                <StoneImage src={item.image} alt="" className="masonry-image" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal Popup */}
      {lightboxProject && createPortal(
        <div
          ref={lightboxRef}
          className="portfolio-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Фотография работы из портфолио"
          onClick={closeLightbox}
          tabIndex={-1}
        >
          <div className="lightbox-content-image-only" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={closeLightbox}
              aria-label="Закрыть фотографию"
            >
              <X size={20} />
            </button>
            <StoneImage src={lightboxProject.image} alt={`Фотография проекта №${lightboxProject.id}`} className="lightbox-only-image" />
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

      {/* Product Quote Form */}
      <section id="callback-form" className="product-quote-section">
        <div className="container">
          <div className="product-quote-wrapper">
            <div className="product-quote-info">
              <span className="section-tag">Расчет изделий</span>
              <h2 className="product-quote-title">Оставить заявку на просчет</h2>
              <p className="product-quote-description">
                Опишите нужное изделие из натурального камня. Мы уточним материал, размеры и обработку, затем подготовим предварительный расчет продукции без монтажных работ.
              </p>

              <div className="product-types-list">
                <div className="product-type-item">
                  <Box size={20} />
                  <span>Столешницы и кухонные острова</span>
                </div>
                <div className="product-type-item">
                  <Layers size={20} />
                  <span>Подоконники, ступени и лестницы</span>
                </div>
                <div className="product-type-item">
                  <Sparkles size={20} />
                  <span>Камины, панели и изделия по эскизу</span>
                </div>
              </div>
            </div>

            <div className="product-quote-form-column">
              {!quoteSubmitted ? (
                <form className="product-quote-form" onSubmit={handleProductQuoteSubmit}>
                  <input className="form-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <div className="product-form-row">
                    <div className="product-form-group">
                      <label htmlFor="quote-name">Ваше имя</label>
                      <input
                        id="quote-name"
                        type="text"
                        placeholder="Александр"
                        value={quoteName}
                        onChange={(event) => setQuoteName(event.target.value)}
                        required
                      />
                    </div>
                    <div className="product-form-group">
                      <label htmlFor="quote-phone">Телефон для связи</label>
                      <input
                        id="quote-phone"
                        type="tel"
                        placeholder="+7 (999) 000-00-00"
                        value={quotePhone}
                        onChange={(event) => setQuotePhone(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="product-form-group">
                    <label htmlFor="quote-product">Какое изделие нужно?</label>
                    <input
                      id="quote-product"
                      type="text"
                      placeholder="Например, столешница из мрамора"
                      value={quoteProduct}
                      onChange={(event) => setQuoteProduct(event.target.value)}
                      required
                    />
                  </div>

                  <div className="product-form-group">
                    <label htmlFor="quote-details">Размеры и пожелания</label>
                    <textarea
                      id="quote-details"
                      rows={4}
                      placeholder="Укажите примерные размеры, выбранный камень или приложите описание задачи"
                      value={quoteDetails}
                      onChange={(event) => setQuoteDetails(event.target.value)}
                    />
                  </div>

                  <ConsentCheckboxes
                    idPrefix="product-quote"
                    policyAccepted={quotePolicyAccepted}
                    consentAccepted={quoteConsentAccepted}
                    onPolicyChange={setQuotePolicyAccepted}
                    onConsentChange={setQuoteConsentAccepted}
                  />

                  <button
                    type="submit"
                    className="btn-gold-solid product-quote-submit"
                    disabled={!quotePolicyAccepted || !quoteConsentAccepted || quoteSubmission.isSubmitting}
                  >
                    {quoteSubmission.isSubmitting ? 'Отправляем…' : 'Оставить заявку на просчет'} <Send size={16} />
                  </button>
                  {quoteSubmission.submitError && <p className="form-submit-error" role="alert">{quoteSubmission.submitError}</p>}
                  <p className="product-quote-note">Заявка предназначена только для расчета продукции.</p>
                </form>
              ) : (
                <div className="product-quote-success" role="status">
                  <CheckCircle size={54} strokeWidth={1.5} />
                  <h3>Заявка на просчет принята</h3>
                  <p>Свяжемся с вами, чтобы уточнить параметры изделия и подготовить расчет.</p>
                  {quoteSubmission.requestId && <p className="form-request-id">Номер обращения: <strong>{quoteSubmission.requestId}</strong></p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Styles for Hub page */}
    </div>
  );
};
