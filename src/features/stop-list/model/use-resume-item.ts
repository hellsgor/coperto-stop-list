'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeMenuItem } from '../api/menu-api';
import { getCachedMenuItem, menuKeys, patchMenuItem } from './queries';
import type { MenuItem } from '@/types/menu';

type ResumeItemVariables = {
  id: string;
};

type ResumeItemContext = {
  previousItem: MenuItem | undefined;
};

export function useResumeItem() {
  const queryClient = useQueryClient();

  return useMutation<MenuItem, Error, ResumeItemVariables, ResumeItemContext>({
    mutationKey: menuKeys.resumeMutation(),
    mutationFn: ({ id }) => resumeMenuItem(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.list() });
      const previousItem = getCachedMenuItem(queryClient, id);

      patchMenuItem(queryClient, id, (item) => ({
        ...item,
        status: { kind: 'available' },
      }));

      return { previousItem };
    },
    onError: (_error, { id }, context) => {
      const previousItem = context?.previousItem;
      if (previousItem) {
        patchMenuItem(queryClient, id, () => previousItem);
      }
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
