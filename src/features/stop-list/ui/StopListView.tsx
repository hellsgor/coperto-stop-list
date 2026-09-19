'use client';

import { useFilters } from '../model/use-filters';
import { Filters } from './Filters';

export function StopListView() {
  const { filters, setFilter } = useFilters();

  return (
    <div className="flex flex-col gap-6 p-6">
      <Filters
        shop={filters.shop}
        status={filters.status}
        onShopChange={(value) => setFilter('shop', value)}
        onStatusChange={(value) => setFilter('status', value)}
      />
    </div>
  );
}
