'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stopMenuItem } from '../api/menu-api';
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
    onSuccess: (updatedItem) => {
      patchMenuItem(queryClient, updatedItem.id, () => updatedItem);
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: menuKeys.all }) === 1) {
        return queryClient.invalidateQueries({ queryKey: menuKeys.list() });
      }
      return undefined;
    },
  });
}
