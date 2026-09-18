import type { MenuItem, StopItemPayload } from '@/types/menu';

const globalForStore = globalThis as typeof globalThis & {
  __menuStore?: MenuItem[];
};

const HOUR_MS = 60 * 60 * 1000;
const MIN_MS = 60 * 1000;
const STEP_MS = 15 * MIN_MS;

function createSeed(): MenuItem[] {
  const now = Math.floor(Date.now() / STEP_MS) * STEP_MS;
  const iso = (offsetMs: number) => new Date(now + offsetMs).toISOString();

  return [
    {
      id: 'menu-1',
      title: 'Борщ',
      shop: 'kitchen',
      stock: 12,
      status: { kind: 'available' },
      updatedAt: iso(0),
    },
    {
      id: 'menu-2',
      title: 'Плов',
      shop: 'kitchen',
      stock: 0,
      status: { kind: 'available' },
      updatedAt: iso(0),
    },
    {
      id: 'menu-3',
      title: 'Стейк рибай',
      shop: 'kitchen',
      stock: 5,
      status: { kind: 'stopped', reason: 'out_of_stock', until: null },
      updatedAt: iso(-HOUR_MS),
    },
    {
      id: 'menu-4',
      title: 'Паста карбонара',
      shop: 'kitchen',
      stock: 20,
      status: { kind: 'available' },
      updatedAt: iso(0),
    },
    {
      id: 'menu-5',
      title: 'Крем-суп грибной',
      shop: 'kitchen',
      stock: 0,
      status: { kind: 'stopped', reason: 'out_of_stock', until: null },
      updatedAt: iso(-2 * HOUR_MS),
    },
    {
      id: 'menu-6',
      title: 'Тартар из говядины',
      shop: 'kitchen',
      stock: 3,
      status: { kind: 'stopped', reason: 'quality', until: iso(30 * MIN_MS) },
      updatedAt: iso(-10 * MIN_MS),
    },
    {
      id: 'menu-7',
      title: 'Морс клюквенный',
      shop: 'bar',
      stock: 30,
      status: { kind: 'available' },
      updatedAt: iso(0),
    },
    {
      id: 'menu-8',
      title: 'Лимонад имбирный',
      shop: 'bar',
      stock: 15,
      status: { kind: 'stopped', reason: 'equipment', until: iso(2 * HOUR_MS) },
      updatedAt: iso(-15 * MIN_MS),
    },
    {
      id: 'menu-9',
      title: 'Капучино',
      shop: 'bar',
      stock: 8,
      status: { kind: 'available' },
      updatedAt: iso(0),
    },
    {
      id: 'menu-10',
      title: 'Эспрессо тоник',
      shop: 'bar',
      stock: 0,
      status: { kind: 'stopped', reason: 'quality', until: iso(-HOUR_MS) },
      updatedAt: iso(-2 * HOUR_MS),
    },
    {
      id: 'menu-11',
      title: 'Чизкейк Нью-Йорк',
      shop: 'pastry',
      stock: 6,
      status: { kind: 'stopped', reason: 'menu_change', until: null },
      updatedAt: iso(-3 * HOUR_MS),
    },
    {
      id: 'menu-12',
      title: 'Тирамису',
      shop: 'pastry',
      stock: 10,
      status: { kind: 'available' },
      updatedAt: iso(0),
    },
    {
      id: 'menu-13',
      title: 'Эклер шоколадный',
      shop: 'pastry',
      stock: 4,
      status: {
        kind: 'stopped',
        reason: 'equipment',
        until: iso(-30 * MIN_MS),
      },
      updatedAt: iso(-HOUR_MS),
    },
    {
      id: 'menu-14',
      title: 'Круассан миндальный',
      shop: 'pastry',
      stock: 18,
      status: { kind: 'available' },
      updatedAt: iso(0),
    },
  ];
}

function getStore(): MenuItem[] {
  globalForStore.__menuStore ??= createSeed();
  return globalForStore.__menuStore;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function maybeFail(probability = 0.2): boolean {
  return Math.random() < probability;
}

// Позиция с истёкшим until и остатком > 0 возвращается в продажу без
// пользовательского действия. При нулевом остатке остаётся в стопе — UI
// показывает «срок истёк» (SPEC §8, допущение 2).
function releaseExpired(item: MenuItem): MenuItem {
  if (item.status.kind !== 'stopped') return item;
  const { until } = item.status;
  if (until === null) return item;
  if (Date.parse(until) > Date.now()) return item;
  if (item.stock <= 0) return item;
  return {
    ...item,
    status: { kind: 'available' },
    updatedAt: new Date().toISOString(),
  };
}

export function getMenuItems(): MenuItem[] {
  const store = getStore();
  const released = store.map(releaseExpired);
  if (released.some((item, index) => item !== store[index])) {
    globalForStore.__menuStore = released;
  }
  return released;
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return getMenuItems().find((item) => item.id === id);
}

export function applyStop(
  id: string,
  payload: StopItemPayload,
): MenuItem | undefined {
  const items = getMenuItems();
  const current = items.find((item) => item.id === id);
  if (!current) return undefined;

  const updated: MenuItem = {
    ...current,
    status: { kind: 'stopped', reason: payload.reason, until: payload.until },
    updatedAt: new Date().toISOString(),
  };
  globalForStore.__menuStore = items.map((item) =>
    item.id === id ? updated : item,
  );
  return updated;
}

export function applyResume(id: string): MenuItem | undefined {
  const items = getMenuItems();
  const current = items.find((item) => item.id === id);
  if (!current) return undefined;

  const updated: MenuItem = {
    ...current,
    status: { kind: 'available' },
    updatedAt: new Date().toISOString(),
  };
  globalForStore.__menuStore = items.map((item) =>
    item.id === id ? updated : item,
  );
  return updated;
}
