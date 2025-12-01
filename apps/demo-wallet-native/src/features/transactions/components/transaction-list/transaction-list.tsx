/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { LegendList, type LegendListProps } from '@legendapp/list';
import { type FC, useCallback } from 'react';
import type { ViewStyle } from 'react-native';

import { useTransactionsStore } from '../../store/store';
import type { Transaction } from '../../types/transaction';
import { TransactionRow } from '../transaction-row';

type ListProps = Omit<LegendListProps<Transaction>, 'data' | 'renderItem' | 'children'>;

interface TransactionListProps extends ListProps {
    itemStyle?: ViewStyle;
    onTransactionPress?: (transactionId: string) => void;
}

export const TransactionList: FC<TransactionListProps> = ({ itemStyle, onTransactionPress, ...props }) => {
    const transactions = useTransactionsStore((state) => state.transactions);

    const handlePress = useCallback(
        (id: string) => {
            onTransactionPress?.(id);
        },
        [onTransactionPress],
    );

    return (
        <LegendList
            data={transactions}
            estimatedItemSize={76}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TransactionRow
                    onPress={onTransactionPress ? () => handlePress(item.id) : undefined}
                    style={itemStyle}
                    transaction={item}
                />
            )}
            showsVerticalScrollIndicator={false}
            {...props}
        />
    );
};
