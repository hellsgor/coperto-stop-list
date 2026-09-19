'use client';

import { useMutationState } from '@tanstack/react-query';
import { menuKeys } from './queries';

function hasItemId(value: unknown): value is { id: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as { id: unknown }).id === 'string'
  );
}

export function usePendingItemIds(): ReadonlySet<string> {
  const ids = useMutationState<string | undefined>({
    filters: { mutationKey: menuKeys.all, status: 'pending' },
    select: (mutation) => {
      const { variables } = mutation.state;
      return hasItemId(variables) ? variables.id : undefined;
    },
  });

  return new Set(ids.filter((id) => id !== undefined));
}
