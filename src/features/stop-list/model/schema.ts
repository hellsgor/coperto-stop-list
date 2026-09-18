import { z } from 'zod';
import type { MenuItemStatus, Shop, StopReason } from '@/types/menu';

export const SHOPS = [
  'kitchen',
  'bar',
  'pastry',
] as const satisfies readonly Shop[];

export const STOP_REASONS = [
  'out_of_stock',
  'equipment',
  'quality',
  'menu_change',
] as const satisfies readonly StopReason[];

export const STATUSES = [
  'available',
  'stopped',
] as const satisfies readonly MenuItemStatus['kind'][];

// Compile-time exhaustiveness checks: fail typecheck if the union types in
// `@/types/menu` gain a member that isn't listed in the arrays above.
type AssertNever<T extends never> = T;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _Exhaustive = [
  AssertNever<Exclude<Shop, (typeof SHOPS)[number]>>,
  AssertNever<Exclude<StopReason, (typeof STOP_REASONS)[number]>>,
  AssertNever<Exclude<MenuItemStatus['kind'], (typeof STATUSES)[number]>>,
];

const MAX_AHEAD_MS = 24 * 60 * 60 * 1000;
const STEP_MS = 15 * 60 * 1000;

export function validateUntil(
  value: string | null,
  now = Date.now(),
): string | null {
  if (value === null) return null;
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return 'Некорректное время';
  if (ts <= now) return 'Время должно быть в будущем';
  if (ts - now > MAX_AHEAD_MS) return 'Не больше чем на 24 часа вперёд';
  if (ts % STEP_MS !== 0) return 'Шаг — 15 минут';
  return null;
}

export const stopItemSchema = z.object(
  {
    reason: z.enum(STOP_REASONS, { error: 'Укажите причину' }),
    until: z
      .string({ error: 'Некорректное время' })
      .nullable()
      .superRefine((value, ctx) => {
        const error = validateUntil(value);
        if (error) {
          ctx.addIssue({ code: 'custom', message: error });
        }
      }),
  },
  { error: 'Некорректные данные формы.' },
);

export const menuFiltersSchema = z.object({
  shop: z.enum(SHOPS).optional().catch(undefined),
  status: z.enum(STATUSES).optional().catch(undefined),
});
