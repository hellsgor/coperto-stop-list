import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { menuListQueryOptions } from '@/features/stop-list/model/queries';
import { StopListView } from '@/features/stop-list/ui/StopListView';
import { getQueryClient } from '@/shared/lib/get-query-client';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(menuListQueryOptions());

  return (
    <main className="flex flex-1 flex-col">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <StopListView />
      </HydrationBoundary>
    </main>
  );
}
