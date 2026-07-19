import React, { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Check, Send, Upload, FileText, CheckCircle, Trash2, Ruler, Shield, Sparkles } from 'lucide-react';
import { mountingServiceGroups } from '../data/mountingServices';
import type { MountingServiceGroup } from '../data/mountingServices';
import { ConsentCheckboxes } from './ConsentCheckboxes';
import { useLeadSubmission } from '../hooks/useLeadSubmission';
import '../styles/Services.css';

interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  icon: string;
  image: string;
  details: string[];
  prices?: { operation: string; cost: string }[];
  priceGroups?: MountingServiceGroup[];
}

const mountingPriceFormatter = new Intl.NumberFormat('ru-RU');

const getAdjustedMountingPrice = (basePrice: number, unit: string) => (
  `от ${mountingPriceFormatter.format(Math.round(basePrice * 1.2))} ₽ / ${unit}`
);

const servicesData: ServiceItem[] = [
  {
    id: 'fabrication',
    title: 'Изготовление изделий',
    shortDesc: 'Столешницы для кухонь и ванных, подоконники, каминные порталы, лестницы и ступени по индивидуальным размерам.',
    icon: '📐',
    image: '/service-fabrication.webp',
    details: [
      'Кухонные столешницы и кухонные острова с бесшовной склейкой фартуков.',
      'Подоконники любой геометрической формы и толщины.',
      'Каминные порталы от минимализма до классических резных вариантов.',
      'Лестницы, ступени и подступенки с нанесением противоскользящих полос.'
    ],
    prices: [
      { operation: 'Столешницы из мрамора', cost: 'от 18 000 ₽ / м²' },
      { operation: 'Столешницы из кварцита', cost: 'от 26 000 ₽ / м²' },
      { operation: 'Подоконники прямые', cost: 'от 8 000 ₽ / п.м.' },
      { operation: 'Каминные порталы', cost: 'от 45 000 ₽ / изд.' },
      { operation: 'Ступени радиальные', cost: 'от 12 000 ₽ / п.м.' }
    ]
  },
  {
    id: 'processing',
    title: 'Обработка камня',
    shortDesc: 'Гидроабразивная резка, фигурная обработка торцов (профилей), реставрация, полировка и состаривание.',
    icon: '⚡',
    image: '/service-processing.webp',
    details: [
      'Гидроабразивная резка (Waterjet) с ЧПУ для создания сложнейших художественных панно и мозаики.',
      'Нарезка фасок и фигурная обработка торцов (более 20 видов профилей: классика, полукруг, Ogee).',
      'Кристаллизация и полировка для восстановления зеркального блеска.',
      'Текстурирование: термообработка, бучардирование и создание эффекта старины (Antik).'
    ],
    prices: [
      { operation: 'Гидроабразивный рез камня', cost: 'от 1 800 ₽ / п.м.' },
      { operation: 'Нарезка технологического профиля (А, V)', cost: 'от 1 200 ₽ / п.м.' },
      { operation: 'Сложный фигурный профиль (Ogee)', cost: 'от 4 500 ₽ / п.м.' },
      { operation: 'Шлифовка & Полировка', cost: 'от 2 000 ₽ / м²' },
      { operation: 'Искусственное состаривание (Antik)', cost: 'от 3 500 ₽ / м²' }
    ]
  },
  {
    id: 'installation',
    title: 'Монтаж и облицовка',
    shortDesc: 'Монтаж столешниц, подоконников, лестниц, полов, стен, цоколей и колонн, а также шлифовка и переполировка камня.',
    icon: '🏛️',
    image: '/service-installation.webp',
    details: [
      'Установка столешниц и фартуков для кухни и ванной.',
      'Монтаж подоконников и подготовка основания.',
      'Установка ступеней, балясин, перил и других элементов лестницы.',
      'Монтаж плиточных, слэбовых и художественных полов.',
      'Шлифовка, переполировка и обработка камня под «антик».',
      'Облицовка стен, цоколей и прямоугольных колонн.'
    ],
    priceGroups: mountingServiceGroups
  }
];

const workflowSteps = [
  {
    num: '01',
    title: 'Консультация & Точный замер',
    desc: 'Обсуждаем задачу, помогаем выбрать материал и снимаем размеры будущего изделия на объекте.'
  },
  {
    num: '02',
    title: 'Проектирование & 3D-раскладка',
    desc: 'Готовим проект изделия и согласовываем раскладку природного рисунка, стыки, кромки и вырезы.'
  },
  {
    num: '03',
    title: 'Высокоточное производство',
    desc: 'Выполняем раскрой и обработку камня по согласованным размерам и техническому заданию.'
  },
  {
    num: '04',
    title: 'Доставка & Монтаж под ключ',
    desc: 'Организуем доставку и устанавливаем готовое изделие с учетом особенностей помещения и основания.'
  }
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = new Set(['pdf', 'dwg', 'jpg', 'jpeg', 'png']);

export const Services: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  
  // Drag & drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  
  // Lead state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectSubmission = useLeadSubmission();

  const toggleCard = (cardId: string) => {
    if (expandedCard === cardId) {
      setExpandedCard(null);
    } else {
      setExpandedCard(cardId);
      // Slight delay to allow animation before scrolling
      setTimeout(() => {
        document.getElementById(`card-${cardId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  };

  const handleScrollToForm = () => {
    document.getElementById('service-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Drag & Drop handlers
  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const addFiles = (newFiles: File[]) => {
    const acceptedFiles: File[] = [];
    const errors: string[] = [];
    let pendingTotalSize = files.reduce((sum, file) => sum + file.size, 0);

    newFiles.forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

      if (!ALLOWED_FILE_EXTENSIONS.has(extension)) {
        errors.push(`${file.name}: неподдерживаемый формат.`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: размер превышает 10 МБ.`);
      } else if (pendingTotalSize + file.size > MAX_TOTAL_FILE_SIZE) {
        errors.push(`${file.name}: общий размер файлов превысит 20 МБ.`);
      } else {
        acceptedFiles.push(file);
        pendingTotalSize += file.size;
      }
    });

    if (acceptedFiles.length > 0) setFiles((previous) => [...previous, ...acceptedFiles]);
    setFileErrors(errors);
  };

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosenFiles = Array.from(e.target.files);
      addFiles(chosenFiles);
      e.target.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !phone || !policyAccepted || !consentAccepted) return;

    const formData = new FormData(e.currentTarget);
    const sent = await projectSubmission.send({
      formType: 'project_quote',
      name,
      phone,
      details: message,
      policyAccepted,
      consentAccepted,
      website: String(formData.get('website') ?? ''),
    }, 'project_quote_sent', files);
    if (sent) setFormSubmitted(true);
  };

  return (
    <div className="services-page fade-in">
      
      {/* 1. HERO-БЛОК */}
      <section className="services-hero">
        <div className="hero-background-overlay" />
        <div className="container hero-content">
          <span className="hero-pre-title">Камень в надежных руках — вечность в каждой детали</span>
          <h1 className="hero-main-title">
            От идеи до монтажа:<br />
            Прикосновение к природе,<br />
            которое останется с вами навсегда
          </h1>
          <p className="hero-sub-text">
            ATLAS STONE сопровождает проект от выбора материала и замера до изготовления и монтажа. Все параметры изделия согласовываются до начала работ.
          </p>
          <button className="btn-gold-solid hero-cta-btn" onClick={handleScrollToForm}>
            Заказать расчет <ArrowRightIcon />
          </button>
        </div>
      </section>

      {/* 2. СЕТКА УСЛУГ */}
      <section className="services-grid-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-subtitle">Что мы делаем</span>
            <h2 className="section-main-title">Наши услуги и возможности</h2>
            <div className="gold-accent-line" />
          </div>

          <div className="services-grid">
            {servicesData.map(service => {
              const isExpanded = expandedCard === service.id;
              return (
                <article 
                  key={service.id} 
                  id={`card-${service.id}`}
                  className={`service-interactive-card ${isExpanded ? 'expanded' : ''}`}
                >
                  <div className="card-top-info">
                    <div className="card-image-bg" style={{ backgroundImage: `url(${service.image})` }} />
                    <div className="card-gradient-overlay" />
                    
                    <div className="card-header-content">
                      <div className="card-icon-box">{service.icon}</div>
                      <h3 className="card-title">{service.title}</h3>
                      <p className="card-short-desc">{service.shortDesc}</p>
                      
                      <button
                        type="button"
                        className="card-toggle-indicator"
                        onClick={() => toggleCard(service.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`service-details-${service.id}`}
                      >
                        {isExpanded ? 'Свернуть детали ↑' : 'Подробнее о ценах ↓'}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Accordion Body */}
                  <div
                    id={`service-details-${service.id}`}
                    className="card-expanded-body"
                    aria-hidden={!isExpanded}
                  >
                    <div className="expanded-body-inner">
                      <div className={`expanded-columns ${service.priceGroups ? 'has-price-groups' : ''}`}>
                        
                        {/* Column 1: Tech specifications */}
                        <div className="expanded-tech-spec">
                          <h4>Включает в себя:</h4>
                          <ul className="expanded-bullet-list">
                            {service.details.map((detail, idx) => (
                              <li key={idx}>
                                <Check size={14} className="bullet-check-icon" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Column 2: Operation Prices */}
                        <div className="expanded-pricing-table">
                          <h4>Базовые тарифы:</h4>
                          {service.priceGroups ? (
                            <div className="price-groups-grid">
                              {service.priceGroups.map((group) => (
                                <div key={group.category} className="price-group">
                                  <h5>{group.category}</h5>
                                  <div className="pricing-items-list">
                                    {group.items.map((price) => (
                                      <div key={`${group.category}-${price.operation}`} className="price-item-row">
                                        <span className="price-operation">{price.operation}</span>
                                        <span className="price-spacer-dots" />
                                        <span className="price-cost">{getAdjustedMountingPrice(price.basePrice, price.unit)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="pricing-items-list">
                              {service.prices?.map((price, idx) => (
                                <div key={idx} className="price-item-row">
                                  <span className="price-operation">{price.operation}</span>
                                  <span className="price-spacer-dots" />
                                  <span className="price-cost">{price.cost}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. БЛОК "КАК МЫ РАБОТАЕМ" */}
      <section className="workflow-section">
        <div className="container">
          <div className="section-title-wrap">
            <span className="section-subtitle">Процесс</span>
            <h2 className="section-main-title">Как мы работаем</h2>
            <div className="gold-accent-line" />
          </div>

          <div className="workflow-timeline">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="workflow-card-step">
                <div className="step-num-badge">
                  <span className="step-num-text">{step.num}</span>
                  <div className="step-num-ring" />
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.desc}</p>
                {idx < workflowSteps.length - 1 && <div className="step-connecting-line" />}
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 5. ИНТЕРАКТИВНЫЙ БЛОК КОНВЕРСИИ */}
      <section id="service-form" className="conversion-section">
        <div className="container">
          <div className="conversion-wrapper">
            
            {/* Info Side */}
            <div className="conversion-info-col">
              <h2 className="conv-title">Заказать расчет проекта</h2>
              <p className="conv-desc">
                Есть готовый дизайн-проект, спецификация или набросок с размерами? Прикрепите файлы ниже. Специалист изучит материалы, уточнит детали и подготовит расчет проекта.
              </p>
              
              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon"><Ruler size={18} /></div>
                  <div>
                    <h5>Замер под задачу</h5>
                    <p>Согласуем выезд, уточним геометрию изделия и особенности объекта.</p>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <div className="benefit-icon"><Shield size={18} /></div>
                  <div>
                    <h5>Понятная спецификация</h5>
                    <p>Зафиксируем материал, размеры, обработку, состав работ и стоимость.</p>
                  </div>
                </div>

                <div className="benefit-item">
                  <div className="benefit-icon"><Sparkles size={18} /></div>
                  <div>
                    <h5>Консультация технолога</h5>
                    <p>Подскажем, как сэкономить на раскрое без ухудшения эстетики.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="conversion-form-col">
              {!formSubmitted ? (
                <form onSubmit={handleSubmit} className="project-blueprint-form">
                  <input className="form-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <div className="form-group">
                    <label htmlFor="service-name">Ваше имя</label>
                    <input 
                      id="service-name"
                      type="text" 
                      placeholder="Александр" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="service-phone">Телефон для связи</label>
                    <input 
                      id="service-phone"
                      type="tel" 
                      placeholder="+7 (999) 000-00-00" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="service-message">Комментарий / Пожелания</label>
                    <textarea 
                      id="service-message"
                      rows={3} 
                      placeholder="Укажите вид изделия, сорт камня, желаемые сроки..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  {/* Drag and Drop Zone */}
                  <div className="form-group">
                    <span className="form-label" id="service-files-label">Прикрепить файлы (Чертежи, ТЗ, Наброски)</span>
                    <button
                      type="button"
                      className={`drag-drop-zone ${isDragOver ? 'dragover' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={triggerFileInput}
                      aria-labelledby="service-files-label"
                    >
                      <Upload size={24} className="upload-icon" />
                      <span className="upload-prompt">Перетащите файлы сюда или <span>выберите на диске</span></span>
                      <span className="upload-sub">PDF, DWG, JPG, PNG: до 10 МБ на файл и 20 МБ суммарно</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      hidden
                      onChange={handleFileChange}
                      accept=".pdf,.dwg,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      multiple
                    />

                    {fileErrors.length > 0 && (
                      <div className="file-errors" role="alert">
                        {fileErrors.map((error, index) => <p key={`${error}-${index}`}>{error}</p>)}
                      </div>
                    )}

                    {/* Files List Preview */}
                    {files.length > 0 && (
                      <div className="attached-files-list">
                        {files.map((file, idx) => (
                          <div key={idx} className="attached-file-item">
                            <FileText size={16} className="file-icon" />
                            <span className="file-name" title={file.name}>{file.name}</span>
                            <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                            <button 
                              type="button" 
                              className="remove-file-btn" 
                              onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                              aria-label={`Удалить файл ${file.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <ConsentCheckboxes
                    idPrefix="service-project"
                    policyAccepted={policyAccepted}
                    consentAccepted={consentAccepted}
                    onPolicyChange={setPolicyAccepted}
                    onConsentChange={setConsentAccepted}
                  />

                  <button
                    type="submit"
                    className="btn-gold-solid submit-project-btn"
                    disabled={!policyAccepted || !consentAccepted || projectSubmission.isSubmitting}
                  >
                    {projectSubmission.isSubmitting ? 'Отправляем…' : 'Отправить на расчет'} <Send size={14} />
                  </button>
                  {projectSubmission.submitError && <p className="form-submit-error" role="alert">{projectSubmission.submitError}</p>}
                </form>
              ) : (
                <div className="form-success-container">
                  <div className="success-check-ring">
                    <CheckCircle size={44} />
                  </div>
                  <h3>Заявка отправлена!</h3>
                  <p>Спасибо, <strong>{name}</strong>. Мы уже передали спецификацию в технологический отдел. Наш специалист перезвонит вам по номеру <strong>{phone}</strong> в течение пары часов.</p>
                  {projectSubmission.requestId && <p className="form-request-id">Номер обращения: <strong>{projectSubmission.requestId}</strong></p>}
                  <button className="btn-gold" onClick={() => { setFormSubmitted(false); setFiles([]); setName(''); setPhone(''); setMessage(''); setPolicyAccepted(false); setConsentAccepted(false); projectSubmission.resetSubmission(); }}>
                    Отправить еще один проект
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

// Simple Arrow icon component for buttons
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-arrow-svg">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);
