/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { GetBalanceOptions } from '@ton/appkit';
import { formatUnits } from '@ton/appkit';

import { useBalance } from '../../hooks/use-balance';
import styles from './balance.module.css';
import { useI18n } from '../../../../hooks/use-i18n';

export interface BalanceProps extends GetBalanceOptions {
    className?: string;
}

export function Balance({ className, ...props }: BalanceProps) {
    const { data: balance, isLoading, error } = useBalance(props);
    const { t } = useI18n();

    if (isLoading) {
        return <div className={`${styles.balance} ${className || ''}`}>{t('Loading...')}</div>;
    }

    if (error) {
        return <div className={`${styles.balance} ${className || ''}`}>{t('Error loading balance')}</div>;
    }

    return <div className={`${styles.balance} ${className || ''}`}>{balance ? formatUnits(balance, 9) : '0'} TON</div>;
}
