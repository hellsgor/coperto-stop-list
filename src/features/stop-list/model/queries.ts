import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { fetchMenuItems } from '../api/menu-api';
import type { MenuItem } from '@/types/menu';

export const menuKeys = {
  all: ['menu'] as const,
  list: () => [...menuKeys.all, 'list'] as const,
  stopMutation: () => [...menuKeys.all, 'stop'] as const,
  resumeMutation: () => [...menuKeys.all, 'resume'] as const,
};

export function menuListQueryOptions() {
  return queryOptions({
    queryKey: menuKeys.list(),
    queryFn: ({ signal }) => fetchMenuItems(signal),
  });
}

export function getCachedMenuItem(
  queryClient: QueryClient,
  id: string,
): MenuItem | undefined {
  return queryClient
    .getQueryData<MenuItem[]>(menuKeys.list())
    ?.find((item) => item.id === id);
}

export function patchMenuItem(
  queryClient: QueryClient,
  id: string,
  updater: (item: MenuItem) => MenuItem,
): void {
  queryClient.setQueryData<MenuItem[]>(menuKeys.list(), (items) =>
    items?.map((item) => (item.id === id ? updater(item) : item)),
  );
}
