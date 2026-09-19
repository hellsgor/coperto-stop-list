import type { MenuItemStatus, Shop, StopReason } from '@/types/menu';

export const SHOP_LABELS: Record<Shop, string> = {
  kitchen: 'Кухня',
  bar: 'Бар',
  pastry: 'Кондитерская',
};

export const STATUS_LABELS: Record<MenuItemStatus['kind'], string> = {
  available: 'В продаже',
  stopped: 'В стоп-листе',
};

export const REASON_LABELS: Record<StopReason, string> = {
  out_of_stock: 'Закончились продукты',
  equipment: 'Сломалось оборудование',
  quality: 'Вопросы к качеству партии',
  menu_change: 'Позиция выведена из меню',
};

export function formatStock(stock: number): string {
  return `${stock} шт.`;
}

const untilTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
});

export function isStopExpired(until: string | null, now: number): boolean {
  return until !== null && Date.parse(until) <= now;
}

export function formatUntil(until: string | null, now: number): string {
  if (until === null) return 'До конца смены';
  if (isStopExpired(until, now)) return 'Срок истёк';
  return `До ${untilTimeFormatter.format(new Date(until))}`;
}
