'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Web3Provider } from '@/contexts/Web3Context';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { useState } from 'react';

/**
 * Root providers for the application
 * Combines React Query, Auth, Web3, and WebSocket providers
 */
export function Providers({ children }) {
  // Create QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Web3Provider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </Web3Provider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
