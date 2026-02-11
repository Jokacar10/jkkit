/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from 'react';
import { AppKitProvider } from '@ton/appkit-ui-react';

import { appKit } from '../services/app-kit';

interface AppKitBridgeProps {
    children: React.ReactNode;
}

export const AppKitBridge: React.FC<AppKitBridgeProps> = ({ children }) => {
    return <AppKitProvider appKit={appKit}>{children}</AppKitProvider>;
};
