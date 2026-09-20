import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { stopMenuItem } from '../api/menu-api';
import { menuKeys } from './queries';
import { useUiStore } from './ui-store';
import { useStopItem } from './use-stop-item';
import type { MenuItem } from '@/types/menu';

jest.mock('../api/menu-api');

const mockedStopMenuItem = jest.mocked(stopMenuItem);

const FAILURE_MESSAGE = 'Не удалось поставить в стоп-лист.';

function createItem(overrides: Partial<MenuItem>): MenuItem {
  const item: MenuItem = {
    id: 'item-1',
    title: 'Плов',
    shop: 'kitchen',
    stock: 5,
    status: { kind: 'available' },
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
  Object.freeze(item.status);
  Object.freeze(item);
  return item;
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useStopItem', () => {
  afterEach(() => {
    mockedStopMenuItem.mockReset();
    useUiStore.setState({ panelItemId: null, toasts: [] });
  });

  it('rolls back the mutated row and shows an error toast when the request fails', async () => {
    const target = createItem({ id: 'item-1', title: 'Плов' });

    const queryClient = new QueryClient();
    queryClient.setQueryData<MenuItem[]>(menuKeys.list(), [target]);

    mockedStopMenuItem.mockRejectedValue(new Error(FAILURE_MESSAGE));

    const { result } = renderHook(() => useStopItem(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      id: target.id,
      payload: { reason: 'out_of_stock', until: null },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const items = queryClient.getQueryData<MenuItem[]>(menuKeys.list());

    const expected = createItem({ id: 'item-1', title: 'Плов' });
    expect(items?.find((item) => item.id === target.id)).toEqual(expected);
    expect(useUiStore.getState().toasts.at(-1)?.message).toBe(FAILURE_MESSAGE);
  });

  it('does not roll back a neighboring row whose mutation is still in flight', async () => {
    const target = createItem({ id: 'item-1', title: 'Плов' });
    const neighbor = createItem({ id: 'item-2', title: 'Борщ' });

    const queryClient = new QueryClient();
    queryClient.setQueryData<MenuItem[]>(menuKeys.list(), [target, neighbor]);

    mockedStopMenuItem.mockImplementation((id) => {
      if (id === target.id) {
        return Promise.reject(new Error(FAILURE_MESSAGE));
      }
      // Never resolves: keeps the neighbor's mutation in flight for the
      // duration of the test, so we can assert the two rows are isolated.
      return new Promise<MenuItem>(() => {});
    });

    const { result } = renderHook(
      () => ({ failing: useStopItem(), pending: useStopItem() }),
      { wrapper: createWrapper(queryClient) },
    );

    result.current.failing.mutate({
      id: target.id,
      payload: { reason: 'out_of_stock', until: null },
    });
    result.current.pending.mutate({
      id: neighbor.id,
      payload: { reason: 'equipment', until: null },
    });

    await waitFor(() => expect(result.current.failing.isError).toBe(true));

    const items = queryClient.getQueryData<MenuItem[]>(menuKeys.list());

    expect(items?.find((item) => item.id === target.id)?.status.kind).toBe(
      'available',
    );
    expect(items?.find((item) => item.id === neighbor.id)?.status.kind).toBe(
      'stopped',
    );
  });
});
