/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { formatUnits } from '@ton/appkit';
import type { FC, ComponentProps } from 'react';
import clsx from 'clsx';

import { Block } from '../../../../components/block';
import { TonIconCircle } from '../../../../components/ton-icon/ton-icon';
import { useSelectedWallet } from '../../../wallets/hooks/use-selected-wallet';
import { useBalance } from '../../hooks/use-balance';
import styles from './ton-balance-badge.module.css';

export const TonBalanceBadge: FC<ComponentProps<'div'>> = ({ className, ...props }) => {
    const [wallet] = useSelectedWallet();
    const address = wallet?.getAddress();
    const { data: balance } = useBalance({ address }, { enabled: !!address });

    if (!wallet) {
        return null;
    }

    return (
        <Block direction="row" className={clsx(styles.balance, className)} {...props}>
            <TonIconCircle size={24} />

            <div className={styles.balanceContainer}>
                <span className={styles.ticker}>TON</span>
                <span>{balance ? formatUnits(balance, 9) : '0'}</span>
            </div>
        </Block>
    );
};
