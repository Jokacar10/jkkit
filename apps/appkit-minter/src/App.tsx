/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AppKitBridge } from '@/features/wallet';
import { AppRouter, ThemeProvider } from '@/core/components';

import './core/styles/app.css';
import '@ton/appkit-ui-react/styles.css';

const queryClient = new QueryClient();

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <QueryClientProvider client={queryClient}>
                <AppKitBridge>
                    <AppRouter />
                    <Toaster position="top-right" richColors />
                </AppKitBridge>
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;
