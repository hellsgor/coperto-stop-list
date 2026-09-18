export type Shop = 'kitchen' | 'bar' | 'pastry';

export type StopReason =
  | 'out_of_stock' // закончились продукты
  | 'equipment' // сломалось оборудование
  | 'quality' // вопросы к качеству партии
  | 'menu_change'; // позиция выведена из меню смены

export type MenuItemStatus =
  | { kind: 'available' }
  | { kind: 'stopped'; reason: StopReason; until: string | null }; // null = до конца смены

export interface MenuItem {
  id: string;
  title: string;
  shop: Shop;
  stock: number; // 0..99
  status: MenuItemStatus;
  updatedAt: string; // ISO
}

export interface StopItemPayload {
  reason: StopReason;
  until: string | null;
}
