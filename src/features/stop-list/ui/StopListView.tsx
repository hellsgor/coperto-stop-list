'use client';

import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'motion/react';
import { Button } from '@/shared/ui/Button';
import { usePendingItemIds } from '../model/use-pending-item-ids';
import { useResumeItem } from '../model/use-resume-item';
import { useFilters } from '../model/use-filters';
import { useMenuList } from '../model/use-menu-list';
import { getCachedMenuItem } from '../model/queries';
import { useUiStore } from '../model/ui-store';
import { Filters } from './Filters';
import { MenuListLoading } from './MenuListLoading';
import { StopListTable } from './StopListTable';
import { StopReasonPanel } from './StopReasonPanel';
import { ToastViewport } from './ToastViewport';

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
  const queryClient = useQueryClient();
  const panelItemId = useUiStore((state) => state.panelItemId);
  const openPanel = useUiStore((state) => state.openPanel);
  const closePanel = useUiStore((state) => state.closePanel);
  // Ищем позицию в полном кэше, а не в отфильтрованном `items`: пока
  // мутация в полёте, оптимистичное изменение статуса может вывести
  // позицию за пределы текущего фильтра, и панель не должна из-за этого
  // размонтироваться раньше, чем придёт ответ сервера. Панель использует
  // из `item` только `id`/`title` для заголовка — остальные поля формы
  // фиксируются в ней самой один раз при монтировании, так что здесь
  // достаточно значения на момент рендера, без отдельной подписки.
  const panelItem = panelItemId
    ? getCachedMenuItem(queryClient, panelItemId)
    : undefined;

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
          onStop={(item) => openPanel(item.id)}
        />
      )}
      <AnimatePresence>
        {panelItem && (
          <StopReasonPanel
            key={panelItem.id}
            item={panelItem}
            onClose={closePanel}
          />
        )}
      </AnimatePresence>
      <ToastViewport />
    </div>
  );
}
