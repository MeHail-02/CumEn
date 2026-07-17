export interface MountingServicePrice {
  operation: string;
  unit: string;
  basePrice: number;
}

export interface MountingServiceGroup {
  category: string;
  items: MountingServicePrice[];
}

export const mountingServiceGroups: MountingServiceGroup[] = [
  {
    category: 'Установка столешниц (кухня, ванна)',
    items: [
      { operation: 'Монтаж прямых столешниц', unit: 'п.м.', basePrice: 5180 },
      { operation: 'Монтаж столешниц 1000×1000 мм и более', unit: 'п.м.', basePrice: 5950 },
      { operation: 'Монтаж радиальных или шаблонных столешниц', unit: 'п.м.', basePrice: 6200 },
      { operation: 'Монтаж шаблонных столешниц 1000×1000 мм и более', unit: 'п.м.', basePrice: 6600 },
      { operation: 'Монтаж фартука высотой до 600 мм', unit: 'п.м.', basePrice: 3500 },
      { operation: 'Монтаж фартука высотой более 600 мм', unit: 'п.м.', basePrice: 4500 },
      { operation: 'Монтаж плинтуса вдоль столешницы', unit: 'п.м.', basePrice: 2650 },
      { operation: 'Отверстие под мойку', unit: 'шт.', basePrice: 5000 },
    ],
  },
  {
    category: 'Установка подоконников',
    items: [
      { operation: 'Монтаж подоконников шириной до 500 мм, длина 1500 мм', unit: 'п.м.', basePrice: 5000 },
      { operation: 'Монтаж подоконников шириной более 500 мм', unit: 'п.м.', basePrice: 5500 },
      { operation: 'Монтаж прямых эркерных подоконников со склейкой', unit: 'п.м.', basePrice: 5280 },
      { operation: 'Монтаж радиальных подоконников со склейкой', unit: 'п.м.', basePrice: 5400 },
      { operation: 'Подготовка штробы под установку подоконника', unit: 'шт.', basePrice: 800 },
      { operation: 'Подготовка основания для установки подоконника', unit: 'п.м.', basePrice: 1000 },
    ],
  },
  {
    category: 'Установка элементов лестницы',
    items: [
      { operation: 'Монтаж прямых ступеней с подступёнком шириной до 350 мм', unit: 'п.м.', basePrice: 5000 },
      { operation: 'Монтаж прямых ступеней с подступёнком шириной более 350 мм', unit: 'п.м.', basePrice: 5500 },
      { operation: 'Монтаж радиальных ступеней с подступёнком шириной до 350 мм', unit: 'п.м.', basePrice: 6000 },
      { operation: 'Монтаж радиальных ступеней с подступёнком шириной более 350 мм', unit: 'п.м.', basePrice: 6500 },
      { operation: 'Монтаж балясин по прямой плоскости', unit: 'шт.', basePrice: 1900 },
      { operation: 'Монтаж балясин по углу лестницы', unit: 'шт.', basePrice: 2500 },
      { operation: 'Монтаж подбалясинника', unit: 'шт.', basePrice: 730 },
      { operation: 'Монтаж прямых перил', unit: 'п.м.', basePrice: 1715 },
      { operation: 'Монтаж радиальных перил', unit: 'п.м.', basePrice: 2290 },
      { operation: 'Монтаж подперильника', unit: 'п.м.', basePrice: 730 },
      { operation: 'Монтаж плинтуса по контуру площадок лестницы', unit: 'п.м.', basePrice: 2600 },
      { operation: 'Монтаж калошницы по контуру ступеней с углом 45°', unit: 'п.м.', basePrice: 3200 },
      { operation: 'Монтаж калошницы по контуру угла лестницы', unit: 'п.м.', basePrice: 3500 },
    ],
  },
  {
    category: 'Монтаж полов',
    items: [
      { operation: 'Монтаж полов плиткой 300×600×20 мм вразбежку', unit: 'м²', basePrice: 3500 },
      { operation: 'Монтаж полов плиткой 300×600×30 мм вразбежку', unit: 'м²', basePrice: 3800 },
      { operation: 'Монтаж полов плиткой 300×600×10 мм', unit: 'м²', basePrice: 3000 },
      { operation: 'Монтаж полов плиткой-мозаикой 305×305×10 мм', unit: 'м²', basePrice: 4180 },
      { operation: 'Монтаж полов плитой 600×600×20(30) мм', unit: 'м²', basePrice: 4180 },
      { operation: 'Монтаж полов плитой 800×800×20(30) или 1000×1000×20 мм', unit: 'м²', basePrice: 5000 },
      { operation: 'Монтаж полов слэбами', unit: 'м²', basePrice: 12000 },
      { operation: 'Монтаж резных полов', unit: 'м²', basePrice: 13000 },
      { operation: 'Монтаж художественных полов из готовых элементов', unit: 'м²', basePrice: 13000 },
      { operation: 'Монтаж плинтуса по контуру пола', unit: 'п.м.', basePrice: 2600 },
      { operation: 'Стяжка и подготовка пола к монтажу, слой до 10 мм', unit: 'м²', basePrice: 700 },
    ],
  },
  {
    category: 'Полировка полов и стен',
    items: [
      { operation: 'Шлифовка мраморных полов со снятием полировки', unit: 'м²', basePrice: 2500 },
      { operation: 'Шлифовка гранитных полов со снятием полировки', unit: 'м²', basePrice: 3500 },
      { operation: 'Переполировка мраморных полов с кристаллизацией', unit: 'м²', basePrice: 5000 },
      { operation: 'Переполировка гранитных полов', unit: 'м²', basePrice: 6000 },
      { operation: 'Переполировка панно и художественных мраморных полов', unit: 'м²', basePrice: 5500 },
      { operation: 'Обработка мраморных полов под «антик»', unit: 'м²', basePrice: 4500 },
    ],
  },
  {
    category: 'Монтаж цоколя, стен и колонн',
    items: [
      { operation: 'Монтаж стен плиткой 300×600×20 мм на высоте до 2 м', unit: 'м²', basePrice: 4000 },
      { operation: 'Монтаж стен плиткой 300×600×20 мм на высоте более 2 м', unit: 'м²', basePrice: 4350 },
      { operation: 'Монтаж стен плиткой 305×305×10 мм на высоте до 2 м', unit: 'м²', basePrice: 3520 },
      { operation: 'Монтаж стен плиткой 305×305×10 мм на высоте более 2 м', unit: 'м²', basePrice: 3870 },
      { operation: 'Монтаж стен плиткой-мозаикой 305×305×10 мм на высоте до 2 м', unit: 'м²', basePrice: 4840 },
      { operation: 'Монтаж стен плиткой-мозаикой 305×305×10 мм на высоте более 2 м', unit: 'м²', basePrice: 5320 },
      { operation: 'Монтаж стен плиткой 600×600×20 мм на высоте до 2 м', unit: 'м²', basePrice: 5000 },
      { operation: 'Монтаж стен плиткой 600×600×20 мм на высоте более 2 м', unit: 'м²', basePrice: 7000 },
      { operation: 'Монтаж стен слэбами площадью 1,1–2 м² на высоте до 4 м', unit: 'м²', basePrice: 12000 },
      { operation: 'Монтаж стен слэбами площадью более 2 м² на высоте до 4 м', unit: 'м²', basePrice: 15000 },
      { operation: 'Облицовка прямоугольных колонн плиткой до 2 м', unit: 'м²', basePrice: 4600 },
      { operation: 'Облицовка прямоугольных колонн вертикальными сегментами до 2 м', unit: 'м²', basePrice: 6050 },
      { operation: 'Монтаж цоколя плиткой 300×600×20 мм высотой до 1 м', unit: 'м²', basePrice: 4000 },
      { operation: 'Монтаж цоколя плиткой 300×600×30 мм высотой до 1 м', unit: 'м²', basePrice: 4400 },
      { operation: 'Монтаж накрывной плиты цоколя шириной до 200 мм', unit: 'п.м.', basePrice: 1595 },
    ],
  },
];
