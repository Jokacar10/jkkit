/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './polyfills'; // Buffer / process polyfills — must come first
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import { App } from './App';
import { Providers } from './Providers';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Providers>
            <App />
        </Providers>
    </StrictMode>,
);
