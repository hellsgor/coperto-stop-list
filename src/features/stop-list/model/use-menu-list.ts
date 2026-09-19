'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { isDebugFail } from './debug';
import { filterMenuItems, type MenuFilters } from './filters';
import { menuListQueryOptions } from './queries';

export function useMenuList(filters: MenuFilters) {
  const searchParams = useSearchParams();
  const debugFail = isDebugFail(searchParams.get('debug'));

  return useQuery({
    ...menuListQueryOptions(debugFail),
    select: (items) => filterMenuItems(items, filters),
  });
}
