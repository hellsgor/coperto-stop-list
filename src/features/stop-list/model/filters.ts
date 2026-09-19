import { menuFiltersSchema } from './schema';
import type { z } from 'zod';
import type { MenuItem } from '@/types/menu';

export type MenuFilters = z.infer<typeof menuFiltersSchema>;

export type RawFilters = Record<string, string | string[] | undefined>;

export function parseFilters(raw: RawFilters): MenuFilters {
  const pick = (key: string): string | undefined => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return menuFiltersSchema.parse({
    shop: pick('shop'),
    status: pick('status'),
  });
}

export function filterMenuItems(
  items: MenuItem[],
  filters: MenuFilters,
): MenuItem[] {
  return items.filter((item) => {
    if (filters.shop && item.shop !== filters.shop) return false;
    if (filters.status && item.status.kind !== filters.status) return false;
    return true;
  });
}
