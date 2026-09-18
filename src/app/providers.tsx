'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/shared/lib/get-query-client';

type Props = {
  children: React.ReactNode;
};

export function Providers({ children }: Props) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
