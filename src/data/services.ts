export interface Service {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  features: string[];
}

export const servicesData: Service[] = [
  {
    id: 'waterjet-cutting',
    name: 'Гидроабразивная резка камня',
    price: 'от 1 800 руб / п.м.',
    description: 'Высокоточный раскрой натурального камня любой сложности по индивидуальным чертежам. Толщина реза до 100 мм. Позволяет создавать сложные геометрические узоры, мозаичные полы и радиусные детали без микротрещин на кромке.',
    image: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&q=80&w=800',
    features: [
      'Точность реза до 0.1 мм',
      'Отсутствие термического воздействия на камень',
      'Фигурная резка любой сложности',
      'Минимальный расход материала'
    ]
  },
  {
    id: 'countertops',
    name: 'Изготовление столешниц и островов',
    price: 'от 22 000 руб / м²',
    description: 'Производство кухонных столешниц, островов и интегрированных раковин из мрамора, гранита и кварцита. Выполняем сложные профили торцов (фаски), подклейку моек снизу, вырезы под варочные панели со специальным армированием.',
    image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800',
    features: [
      'Снятие замеров лазерным 3D-сканером',
      'Бесшовные стыки по технологии Bookmatch',
      'Армирование вырезов стальными стержнями',
      'Обработка защитными составами премиум-класса'
    ]
  },
  {
    id: 'fireplaces',
    name: 'Облицовка каминов и порталов',
    price: 'от 45 000 руб / изд.',
    description: 'Создание каминных порталов от классических резных до современных монолитных из цельных плит камня. Тщательный подбор рисунка прожилок камня. Интеграция с топками любого типа с соблюдением всех норм пожарной безопасности.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
    features: [
      '3D-моделирование портала перед производством',
      'Жаропрочные клеевые составы',
      'Идеальная стыковка узоров на углах',
      'Художественная резьба вручную'
    ]
  },
  {
    id: 'installation',
    name: 'Профессиональный монтаж',
    price: 'расчет индивидуально',
    description: 'Установка готовых изделий на объекте любой сложности. Монтаж крупноформатных стеновых панелей (панно) с подсветкой, укладка полов, монтаж лестниц. Собственная бригада такелажников со специализированным оборудованием.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    features: [
      'Собственный автопарк со специальными пирамидами для плит (камня)',
      'Монтаж без пыли и грязи на объекте',
      'Гарантия на монтажные работы 5 лет',
      'Финишная полировка и кристаллизация швов на месте'
    ]
  }
];

export interface PortfolioItem {
  id: string;
  title: string;
  serviceId: string;
  image: string;
  location: string;
  stoneUsed: string;
}

export const portfolioData: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'Кухонный остров из кварцита Patagonia',
    serviceId: 'countertops',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    location: 'Коттеджный поселок Барвиха',
    stoneUsed: 'Кварцит Patagonia (Бразилия)'
  },
  {
    id: 'p2',
    title: 'Каминный зал с облицовкой Calacatta Gold',
    serviceId: 'fireplaces',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
    location: 'Пентхаус на Патриарших прудах',
    stoneUsed: 'Мрамор Calacatta Gold (Италия)'
  },
  {
    id: 'p3',
    title: 'Ванная комната в едином камне Carrara White',
    serviceId: 'installation',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800',
    location: 'ЖК Knightsbridge Private Park',
    stoneUsed: 'Мрамор Carrara White (Италия)'
  },
  {
    id: 'p4',
    title: 'Минималистичная столешница в ванную комнату',
    serviceId: 'countertops',
    image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=800',
    location: 'Апартаменты в Сити',
    stoneUsed: 'Кварцит Taj Mahal'
  }
];
