/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GetBalanceOptions } from '@ton/appkit';
import { fromNano } from '@ton/core';

import { useBalance } from '../../hooks/use-balance';
import styles from './balance.module.css';

export interface BalanceProps extends GetBalanceOptions {
    className?: string;
}

export function Balance({ className, ...props }: BalanceProps) {
    const { data: balance, isLoading, error } = useBalance(props);

    if (isLoading) {
        return <div className={`${styles.balance} ${className || ''}`}>Loading...</div>;
    }

    if (error) {
        return <div className={`${styles.balance} ${className || ''}`}>Error loading balance</div>;
    }

    return <div className={`${styles.balance} ${className || ''}`}>{balance ? fromNano(balance) : '0'} TON</div>;
}
