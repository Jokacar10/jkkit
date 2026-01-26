import type { TokenAmount, Network } from '@ton/walletkit';
import type { AppKit } from '../../../core/app-kit';
import { queryBalance } from './query-balance';
import { getSelectedWallet, watchSelectedWallet } from '../../wallets';

export type QueryBalanceOfSelectedWalletParameters = {
    network?: Network;
    onChange: (balance: TokenAmount | null) => void;
};

export type QueryBalanceOfSelectedWalletReturnType = () => void;

export function queryBalanceOfSelectedWallet(
    appKit: AppKit,
    parameters: QueryBalanceOfSelectedWalletParameters
): QueryBalanceOfSelectedWalletReturnType {
    let unsubscribeBalanceQuery: (() => void) | null = null;
    let currentWalletAddress: string | null = null;

    const setupBalanceQuery = () => {
        if (unsubscribeBalanceQuery) {
            unsubscribeBalanceQuery();
            unsubscribeBalanceQuery = null;
        }

        const selectedWallet = getSelectedWallet(appKit);

        if (!selectedWallet) {
            currentWalletAddress = null;
            parameters.onChange(null);
            return;
        }

        currentWalletAddress = selectedWallet.getAddress();

        unsubscribeBalanceQuery = queryBalance(appKit, {
            address: currentWalletAddress,
            network: parameters.network,
            onChange: (balance) => {
                parameters.onChange(balance);
            }
        });
    };

    // Initial setup
    setupBalanceQuery();

    // Watch for selected wallet changes
    const unsubscribeWalletWatcher = watchSelectedWallet(appKit, {
        onChange: () => {
            const newWallet = getSelectedWallet(appKit);
            const newAddress = newWallet?.getAddress() ?? null;

            if (newAddress !== currentWalletAddress) {
                setupBalanceQuery();
            }
        }
    });

    return () => {
        if (unsubscribeBalanceQuery) {
            unsubscribeBalanceQuery();
        }
        unsubscribeWalletWatcher();
    };
}
