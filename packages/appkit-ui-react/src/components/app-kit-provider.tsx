/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import { createContext } from 'react';
import type { TonConnectUIProviderProps } from '@tonconnect/ui-react';
import { TonConnectUI, TonConnectUIContext } from '@tonconnect/ui-react';
import { CreateAppKit } from '@ton/appkit';
import type { AppKit, AppKitConfig } from '@ton/appkit';

import { isClientSide } from '../utils/web';

export const AppKitContext = createContext<AppKit | null>(null);

let tonConnectUI: TonConnectUI | null = null;
let appKit: AppKit | null = null;

type AppKitProviderProps = TonConnectUIProviderProps & {
    appKitOptions?: AppKitConfig;
};

/**
 * Add AppKitProvider to the root of the app. You can specify UI options using props.
 * All TonConnect UI hooks calls and `<TonConnectButton />` component must be placed inside `<AppKitProvider>`.
 * @param children JSX to insert.
 * @param [options] additional options.
 * @constructor
 */
export const AppKitProvider: FC<AppKitProviderProps> = ({ children, appKitOptions, ...tonConnectOptions }) => {
    if (isClientSide() && !tonConnectUI) {
        tonConnectUI = new TonConnectUI(tonConnectOptions);
        appKit = CreateAppKit(appKitOptions || {});
    }

    return (
        <TonConnectUIContext.Provider value={tonConnectUI}>
            <AppKitContext.Provider value={appKit}>{children}</AppKitContext.Provider>
        </TonConnectUIContext.Provider>
    );
};
