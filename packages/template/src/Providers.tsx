/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppKitProvider } from '@ton/appkit-react';
import '@ton/appkit-react/styles.css';
import type { ReactNode } from 'react';

import { appKit } from './appKit';

// QueryClientProvider MUST wrap AppKitProvider.
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000,
            retry: 1,
        },
    },
});

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <AppKitProvider appKit={appKit}>{children}</AppKitProvider>
        </QueryClientProvider>
    );
}
