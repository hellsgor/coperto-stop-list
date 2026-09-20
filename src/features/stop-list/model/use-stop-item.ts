'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stopMenuItem } from '../api/menu-api';
import { REASON_LABELS } from '../lib/format';
import { getCachedMenuItem, menuKeys, patchMenuItem } from './queries';
import { useUiStore } from './ui-store';
import type { MenuItem, StopItemPayload } from '@/types/menu';

type StopItemVariables = {
  id: string;
  payload: StopItemPayload;
};

type StopItemContext = {
  previousItem: MenuItem | undefined;
};

export function useStopItem() {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, StopItemVariables, StopItemContext>({
    mutationKey: menuKeys.stopMutation(),
    mutationFn: ({ id, payload }) => stopMenuItem(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.list() });
      const previousItem = getCachedMenuItem(queryClient, id);

      patchMenuItem(queryClient, id, (item) => ({
        ...item,
        status: {
          kind: 'stopped',
          reason: payload.reason,
          until: payload.until,
        },
      }));

      return { previousItem };
    },
    onError: (error, { id }, context) => {
      const previousItem = context?.previousItem;
      if (previousItem) {
        patchMenuItem(queryClient, id, () => previousItem);
      }
      useUiStore.getState().pushToast(error.message);
    },
    onSuccess: (updatedItem, _variables, context) => {
      patchMenuItem(queryClient, updatedItem.id, () => updatedItem);
      if (updatedItem.status.kind === 'stopped') {
        const wasStopped = context?.previousItem?.status.kind === 'stopped';
        const reasonLabel = REASON_LABELS[updatedItem.status.reason];
        useUiStore
          .getState()
          .pushToast(
            wasStopped
              ? `Стоп позиции «${updatedItem.title}» обновлён: ${reasonLabel}.`
              : `Позиция «${updatedItem.title}» поставлена в стоп-лист: ${reasonLabel}.`,
          );
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: menuKeys.all }) === 1) {
        return queryClient.invalidateQueries({ queryKey: menuKeys.list() });
      }
      return undefined;
    },
  });
}
