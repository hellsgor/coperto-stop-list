import { menuFiltersSchema } from './schema';
import type { z } from 'zod';

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
