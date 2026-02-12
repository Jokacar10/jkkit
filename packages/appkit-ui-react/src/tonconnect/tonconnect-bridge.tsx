/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMemo } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import type { TonConnectConnector } from '@ton/appkit/tonconnect';
import { TONCONNECT_DEFAULT_CONNECTOR_ID } from '@ton/appkit/tonconnect';

import { useConnectorById } from '../features/wallets/hooks/use-connector-by-id';

export interface TonConnectBridgeProps extends PropsWithChildren {
    connectorId?: string;
}

/**
 * @deprecated This component is intended for migration purposes only.
 * It allows you to use `TonConnectUIProvider` with `TonConnectConnector` from AppKit.
 *
 * Please migrate to using AppKit's native hooks and components.
 */
export const TonConnectBridge: FC<TonConnectBridgeProps> = ({
    children,
    connectorId = TONCONNECT_DEFAULT_CONNECTOR_ID,
}) => {
    const connector = useConnectorById(connectorId) as TonConnectConnector | undefined;
    const tonConnectUI = useMemo(() => connector?.tonConnectUI, [connector]);

    if (!tonConnectUI) {
        throw new Error('TonConnectUI not found');
    }

    return <TonConnectUIProvider instance={tonConnectUI}>{children}</TonConnectUIProvider>;
};
