export type StoneColor = 'белый' | 'черный' | 'зеленый' | 'синий' | 'бежевый' | 'серый' | 'коричневый' | 'красный' | 'желтый' | 'розовый';

export interface Stone {
  id: string;
  name: string;
  type: 'мрамор' | 'гранит' | 'кварцит' | 'оникс' | 'травертин' | 'лабрадорит' | 'песчаник' | 'известняк';
  color: StoneColor | StoneColor[];
  origin: string;
  price: number;
  image: string;
  description: string;
  thickness: string[];
  inStock: boolean;
  slabSize: string;
  rarity: 'Импорт' | 'Коллекционный' | 'Урал' | 'Карелия' | 'Россия';
  density?: string;
  waterAbsorption?: string;
  frostResistance?: string;
  abrasion?: string;
  compressiveStrength?: string;
  radiationClass?: string;
  porosity?: string;
  isPriceFrom?: boolean;
}
