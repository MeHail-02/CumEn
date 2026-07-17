import React, { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Check, Send, Upload, FileText, CheckCircle, Trash2, Ruler, Shield, Sparkles } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  shortDesc: string;
  icon: string;
  image: string;
  details: string[];
  prices: { operation: string; cost: string }[];
}

const servicesData: ServiceItem[] = [
  {
    id: 'fabrication',
    title: 'Изготовление изделий',
    shortDesc: 'Столешницы для кухонь и ванных, подоконники, каминные порталы, лестницы и ступени по индивидуальным размерам.',
    icon: '📐',
    image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800',
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
    image: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&q=80&w=800',
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
    shortDesc: 'Профессиональная укладка полов, монтаж панно типа «бабочка» (bookmatch), облицовка стен и интеграция подсветки.',
    icon: '🏛️',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800',
    details: [
      'Укладка крупноформатных плит на пол с калибровкой швов на месте.',
      'Облицовка стен вертикальными плитами из камня с подбором рисунка прожилок.',
      'Монтаж светопрозрачных панно из оникса или кварцита со встроенной LED-подсветкой.',
      'Сухой монтаж на фасадные подсистемы (вентилируемые фасады).'
    ],
    prices: [
      { operation: 'Укладка каменных полов', cost: 'от 4 500 ₽ / м²' },
      { operation: 'Облицовка стен (крупный формат)', cost: 'от 6 000 ₽ / м²' },
      { operation: 'Монтаж панно с подсветкой', cost: 'от 12 000 ₽ / м²' },
      { operation: 'Монтаж кухонной столешницы', cost: 'от 7 000 ₽ / изд.' },
      { operation: 'Кристаллизация швов после укладки', cost: 'от 1 500 ₽ / м²' }
    ]
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

const MAX_FILE_SIZE = 50 * 1024 * 1024;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const addFiles = (newFiles: File[]) => {
    const acceptedFiles: File[] = [];
    const errors: string[] = [];

    newFiles.forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

      if (!ALLOWED_FILE_EXTENSIONS.has(extension)) {
        errors.push(`${file.name}: неподдерживаемый формат.`);
      } else if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: размер превышает 50 МБ.`);
      } else {
        acceptedFiles.push(file);
      }
    });

    if (acceptedFiles.length > 0) {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
    setFileErrors(errors);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    console.log('Project Quote Submission:', {
      name,
      phone,
      message,
      attachedFilesCount: files.length,
      fileNames: files.map(f => f.name)
    });

    setFormSubmitted(true);
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
            Вызвать замерщика с образцами <ArrowRightIcon />
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
                  <div className="card-top-info" onClick={() => toggleCard(service.id)}>
                    <div className="card-image-bg" style={{ backgroundImage: `url(${service.image})` }} />
                    <div className="card-gradient-overlay" />
                    
                    <div className="card-header-content">
                      <div className="card-icon-box">{service.icon}</div>
                      <h3 className="card-title">{service.title}</h3>
                      <p className="card-short-desc">{service.shortDesc}</p>
                      
                      <button className="card-toggle-indicator">
                        {isExpanded ? 'Свернуть детали ↑' : 'Подробнее о ценах ↓'}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Accordion Body */}
                  <div className="card-expanded-body">
                    <div className="expanded-body-inner">
                      <div className="expanded-columns">
                        
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
                          <div className="pricing-items-list">
                            {service.prices.map((price, idx) => (
                              <div key={idx} className="price-item-row">
                                <span className="price-operation">{price.operation}</span>
                                <span className="price-spacer-dots" />
                                <span className="price-cost">{price.cost}</span>
                              </div>
                            ))}
                          </div>
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
                  <div className="form-group">
                    <label>Ваше имя</label>
                    <input 
                      type="text" 
                      placeholder="Александр" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Телефон для связи</label>
                    <input 
                      type="tel" 
                      placeholder="+7 (999) 000-00-00" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Комментарий / Пожелания</label>
                    <textarea 
                      rows={3} 
                      placeholder="Укажите вид изделия, сорт камня, желаемые сроки..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  {/* Drag and Drop Zone */}
                  <div className="form-group">
                    <label>Прикрепить файлы (Чертежи, ТЗ, Наброски)</label>
                    <div 
                      className={`drag-drop-zone ${isDragOver ? 'dragover' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={triggerFileInput}
                    >
                      <Upload size={24} className="upload-icon" />
                      <p className="upload-prompt">Перетащите файлы сюда или <span>выберите на диске</span></p>
                      <span className="upload-sub">Поддерживаются PDF, DWG, JPG, PNG до 50MB</span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        onChange={handleFileChange}
                        accept=".pdf,.dwg,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                        multiple
                      />
                    </div>

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
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn-gold-solid submit-project-btn">
                    Отправить на расчет <Send size={14} />
                  </button>
                </form>
              ) : (
                <div className="form-success-container">
                  <div className="success-check-ring">
                    <CheckCircle size={44} />
                  </div>
                  <h3>Заявка отправлена!</h3>
                  <p>Спасибо, <strong>{name}</strong>. Мы уже передали спецификацию в технологический отдел. Наш специалист перезвонит вам по номеру <strong>{phone}</strong> в течение пары часов.</p>
                  <button className="btn-gold" onClick={() => { setFormSubmitted(false); setFiles([]); setName(''); setPhone(''); setMessage(''); }}>
                    Отправить еще один проект
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Styles for Services */}
      <style>{`
        .services-page {
          background-color: var(--color-bg-dark);
          color: var(--color-text-dark);
        }

        /* 1. HERO SECTION */
        .services-hero {
          position: relative;
          min-height: 100vh;
          min-height: 100svh;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          padding: 140px 0 100px;
          background: linear-gradient(to bottom, rgba(15, 16, 18, 0.68), rgba(15, 16, 18, 0.42)),
                      url('/services-hero-v2.png');
          background-size: cover;
          background-position: center;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hero-content {
          max-width: 850px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero-pre-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: var(--color-accent-gold);
          margin-bottom: 16px;
          display: inline-block;
          font-weight: 500;
        }

        .hero-main-title {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          line-height: 1.15;
          color: #ffffff;
          margin-bottom: 24px;
          text-shadow: 0 2px 20px rgba(0, 0, 0, 0.35);
        }

        .hero-sub-text {
          font-size: 1.05rem;
          line-height: 1.7;
          color: var(--color-text-dark-muted);
          margin-bottom: 35px;
          font-weight: 300;
        }

        .hero-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        /* SECTION TITLES */
        .section-title-wrap {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-subtitle {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--color-accent-gold);
          display: block;
          margin-bottom: 10px;
        }

        .section-main-title {
          font-size: 2.2rem;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .gold-accent-line {
          width: 50px;
          height: 1px;
          background-color: var(--color-accent-gold);
          margin: 0 auto;
        }

        /* 2. SERVICES GRID */
        .services-grid-section {
          padding: 100px 0;
        }

        .services-grid {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .service-interactive-card {
          background-color: var(--color-bg-card-dark);
          border: 1px solid rgba(255, 255, 255, 0.03);
          overflow: hidden;
          transition: var(--transition-smooth);
        }

        .service-interactive-card:hover {
          transform: translateY(-5px);
          border-color: rgba(197, 168, 128, 0.2);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .card-top-info {
          position: relative;
          padding: 60px;
          cursor: pointer;
          min-height: 280px;
          display: flex;
          align-items: center;
        }

        @media (max-width: 768px) {
          .card-top-info {
            padding: 30px 20px;
            min-height: 220px;
          }
        }

        .card-image-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0.15;
          transition: var(--transition-smooth);
        }

        .service-interactive-card:hover .card-image-bg {
          opacity: 0.25;
          transform: scale(1.03);
        }

        .card-gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(15,16,18,0.95) 40%, rgba(15,16,18,0.4) 100%);
        }

        .card-header-content {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .card-icon-box {
          font-size: 2.2rem;
          margin-bottom: 15px;
        }

        .card-title {
          font-size: 1.8rem;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .card-short-desc {
          font-size: 0.92rem;
          color: var(--color-text-dark-muted);
          max-width: 650px;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .card-toggle-indicator {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-accent-gold);
          font-weight: 600;
          margin-top: 10px;
        }

        /* Accordion transition logic */
        .card-expanded-body {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          border-top: 1px solid transparent;
        }

        .service-interactive-card.expanded .card-expanded-body {
          max-height: 800px; /* arbitrary large value */
          border-top-color: rgba(255, 255, 255, 0.05);
        }

        .expanded-body-inner {
          padding: 50px 60px;
          background-color: rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .expanded-body-inner {
            padding: 30px 20px;
          }
        }

        .expanded-columns {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 50px;
        }

        @media (max-width: 900px) {
          .expanded-columns {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        .expanded-tech-spec h4, .expanded-pricing-table h4 {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-accent-gold);
          margin-bottom: 20px;
        }

        .expanded-bullet-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .expanded-bullet-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.88rem;
          line-height: 1.5;
          color: var(--color-text-dark-muted);
        }

        .bullet-check-icon {
          color: var(--color-accent-gold);
          margin-top: 3px;
          flex-shrink: 0;
        }

        .pricing-items-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .price-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.88rem;
        }

        .price-operation {
          color: #ffffff;
        }

        .price-spacer-dots {
          flex-grow: 1;
          height: 1px;
          border-bottom: 1px dotted rgba(255, 255, 255, 0.1);
          margin: 0 15px;
        }

        .price-cost {
          color: var(--color-accent-gold);
          font-weight: 500;
          white-space: nowrap;
        }

        /* 3. WORKFLOW TIMELINE */
        .workflow-section {
          padding: 100px 0;
          background-color: rgba(255,255,255,0.005);
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .workflow-timeline {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
          margin-top: 60px;
        }

        @media (max-width: 900px) {
          .workflow-timeline {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 500px) {
          .workflow-timeline {
            grid-template-columns: 1fr;
          }
        }

        .workflow-card-step {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 20px;
        }

        .step-num-badge {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 70px;
          height: 70px;
          margin-bottom: 24px;
        }

        .step-num-text {
          font-family: var(--font-serif);
          font-size: 1.6rem;
          color: #ffffff;
          font-weight: 400;
          z-index: 2;
        }

        .step-num-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 1px solid rgba(197, 168, 128, 0.2);
          border-radius: 50%;
          background-color: rgba(15,16,18,0.5);
          z-index: 1;
          transition: var(--transition-smooth);
        }

        .workflow-card-step:hover .step-num-ring {
          border-color: var(--color-accent-gold);
          transform: scale(1.08);
          box-shadow: 0 0 15px rgba(197, 168, 128, 0.2);
        }

        .step-title {
          font-size: 1.15rem;
          color: #ffffff;
          margin-bottom: 12px;
          font-weight: 400;
        }

        .step-description {
          font-size: 0.82rem;
          line-height: 1.6;
          color: var(--color-text-dark-muted);
          font-weight: 300;
        }

        .step-connecting-line {
          position: absolute;
          top: 35px;
          left: calc(50% + 35px);
          width: calc(100% - 70px);
          height: 1px;
          background: linear-gradient(to right, rgba(197, 168, 128, 0.3) 0%, rgba(197, 168, 128, 0.02) 100%);
          z-index: 0;
        }

        @media (max-width: 900px) {
          .step-connecting-line {
            display: none;
          }
        }



        /* 5. CONVERSION SECTION */
        .conversion-section {
          padding-bottom: 100px;
        }

        .conversion-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          background-color: var(--color-bg-card-dark);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        @media (max-width: 900px) {
          .conversion-wrapper {
            grid-template-columns: 1fr;
          }
        }

        .conversion-info-col {
          padding: 60px;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .conversion-info-col {
            padding: 30px 20px;
          }
        }

        .conv-title {
          font-size: 2.2rem;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .conv-desc {
          font-size: 0.9rem;
          color: var(--color-text-dark-muted);
          line-height: 1.6;
          margin-bottom: 40px;
          font-weight: 300;
        }

        .benefits-list {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .benefit-item {
          display: flex;
          gap: 15px;
          align-items: flex-start;
        }

        .benefit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1px solid rgba(197, 168, 128, 0.2);
          color: var(--color-accent-gold);
          flex-shrink: 0;
          background-color: rgba(197, 168, 128, 0.03);
        }

        .benefit-item h5 {
          font-size: 0.95rem;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .benefit-item p {
          font-size: 0.78rem;
          color: var(--color-text-dark-muted);
          line-height: 1.4;
        }

        /* Form Col */
        .conversion-form-col {
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background-color: rgba(255, 255, 255, 0.005);
        }

        @media (max-width: 768px) {
          .conversion-form-col {
            padding: 30px 20px;
          }
        }

        .project-blueprint-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-accent-gold);
          font-weight: 500;
        }

        .form-group input[type="text"],
        .form-group input[type="tel"],
        .form-group textarea {
          background-color: rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 16px;
          color: #ffffff;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          outline: none;
          transition: var(--transition-fast);
        }

        .form-group input[type="text"]:focus,
        .form-group input[type="tel"]:focus,
        .form-group textarea:focus {
          border-color: var(--color-accent-gold);
        }

        /* Drag & Drop */
        .drag-drop-zone {
          border: 1px dashed rgba(255, 255, 255, 0.15);
          background-color: rgba(0, 0, 0, 0.1);
          padding: 25px;
          text-align: center;
          cursor: pointer;
          transition: var(--transition-fast);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .drag-drop-zone:hover, .drag-drop-zone.dragover {
          border-color: var(--color-accent-gold);
          background-color: rgba(197, 168, 128, 0.04);
        }

        .upload-icon {
          color: var(--color-accent-gold);
        }

        .upload-prompt {
          font-size: 0.85rem;
          color: #ffffff;
        }

        .upload-prompt span {
          color: var(--color-accent-gold);
          text-decoration: underline;
        }

        .upload-sub {
          font-size: 0.7rem;
          color: var(--color-text-dark-muted);
        }

        .file-errors {
          margin-top: 10px;
          color: #e7a1a1;
          font-size: 0.75rem;
          line-height: 1.5;
        }

        /* Attached files list */
        .attached-files-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }

        .attached-file-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 10px 15px;
          font-size: 0.78rem;
        }

        .file-icon {
          color: var(--color-accent-gold);
          flex-shrink: 0;
        }

        .file-name {
          color: #ffffff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex-grow: 1;
        }

        .file-size {
          color: var(--color-text-dark-muted);
          flex-shrink: 0;
        }

        .remove-file-btn {
          color: var(--color-text-dark-muted);
          transition: var(--transition-fast);
          display: flex;
          align-items: center;
        }

        .remove-file-btn:hover {
          color: #ef4444;
        }

        .submit-project-btn {
          margin-top: 10px;
          padding: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        /* Success screen */
        .form-success-container {
          text-align: center;
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .success-check-ring {
          color: #10b981;
        }

        .form-success-container h3 {
          font-size: 1.5rem;
          color: #ffffff;
        }

        .form-success-container p {
          font-size: 0.85rem;
          color: var(--color-text-dark-muted);
          line-height: 1.6;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

// Simple Arrow icon component for buttons
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-arrow-svg">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
    <style>{`
      .btn-arrow-svg {
        transition: transform 0.3s ease;
      }
      button:hover .btn-arrow-svg {
        transform: translateX(4px);
      }
    `}</style>
  </svg>
);
