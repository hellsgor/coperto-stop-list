'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { parseFilters, type MenuFilters } from './filters';

type SetFilter = <K extends keyof MenuFilters>(
  key: K,
  value: MenuFilters[K],
) => void;

export function useFilters(): { filters: MenuFilters; setFilter: SetFilter } {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const filters = useMemo(
    () =>
      parseFilters({
        shop: searchParams.get('shop') ?? undefined,
        status: searchParams.get('status') ?? undefined,
      }),
    [searchParams],
  );

  const setFilter = useCallback<SetFilter>(
    (key, value) => {
      const currentSearch = window.location.search.replace(/^\?/, '');
      const params = new URLSearchParams(currentSearch);
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      const query = params.toString();
      if (query === currentSearch) return;
      const url = `${pathname}${query ? `?${query}` : ''}`;
      window.history.pushState(null, '', url);
    },
    [pathname],
  );

  return { filters, setFilter };
}
