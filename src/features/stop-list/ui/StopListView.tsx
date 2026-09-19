'use client';

import { Button } from '@/shared/ui/Button';
import { usePendingItemIds } from '../model/use-pending-item-ids';
import { useResumeItem } from '../model/use-resume-item';
import { useFilters } from '../model/use-filters';
import { useMenuList } from '../model/use-menu-list';
import { Filters } from './Filters';
import { MenuListLoading } from './MenuListLoading';
import { StopListTable } from './StopListTable';

export function StopListView() {
  const { filters, setFilter } = useFilters();
  const {
    data: items,
    dataUpdatedAt,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useMenuList(filters);
  const pendingIds = usePendingItemIds();
  const resumeMutation = useResumeItem();

  return (
    <div className="flex flex-col gap-6 p-6">
      <Filters
        shop={filters.shop}
        status={filters.status}
        onShopChange={(value) => setFilter('shop', value)}
        onStatusChange={(value) => setFilter('status', value)}
      />
      {isLoading && <MenuListLoading />}
      {isError && (
        <div className="flex flex-col items-start gap-3 p-6">
          <p className="text-accent text-sm">{error.message}</p>
          <Button
            variant="secondary"
            isLoading={isFetching}
            onClick={() => refetch()}
          >
            Повторить
          </Button>
        </div>
      )}
      {!isLoading && !isError && items !== undefined && items.length === 0 && (
        <p className="text-foreground/70 text-sm">
          Нет позиций по выбранным фильтрам.
        </p>
      )}
      {!isLoading && !isError && items !== undefined && items.length > 0 && (
        <StopListTable
          items={items}
          pendingIds={pendingIds}
          asOf={dataUpdatedAt}
          onResume={(item) => resumeMutation.mutate({ id: item.id })}
          onStop={() => {}}
        />
      )}
    </div>
  );
}
