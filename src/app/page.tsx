import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { isDebugFail } from '@/features/stop-list/model/debug';
import { menuListQueryOptions } from '@/features/stop-list/model/queries';
import { StopListView } from '@/features/stop-list/ui/StopListView';
import { getQueryClient } from '@/shared/lib/get-query-client';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: PageProps<'/'>) {
  const params = await searchParams;
  const debugFail = isDebugFail(params.debug);

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(menuListQueryOptions(debugFail));

  return (
    <main className="flex flex-1 flex-col">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <StopListView />
      </HydrationBoundary>
    </main>
  );
}
