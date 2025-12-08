/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { type FC, memo } from 'react';
import type { ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { Transaction } from '../../types/transaction';

import { ActiveTouchAction } from '@/core/components/active-touch-action';
import { AppText } from '@/core/components/app-text';
import { Block } from '@/core/components/block';
import { Column, Row } from '@/core/components/grid';
import { TextAmount } from '@/core/components/text-amount';
import { fromMinorUnit } from '@/core/utils/amount/minor-unit';

interface TransactionRowProps {
    transaction: Transaction;
    onPress?: () => void;
    style?: ViewProps['style'];
}

export const TransactionRow: FC<TransactionRowProps> = memo(({ transaction, onPress, style }) => {
    const { theme } = useUnistyles();

    const formatAddress = (addr: string): string => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
    };

    const isError = transaction.status === 'failed';
    const isPending = transaction.status === 'pending';
    const isSend = transaction.type === 'send';

    const iconName = isSend ? 'arrow-up-outline' : 'arrow-down-outline';
    const iconColor = theme.colors.text.secondary;

    return (
        <ActiveTouchAction disabled={!onPress} onPress={onPress} scaling={0.98}>
            <Block style={[styles.container, style]}>
                <Row style={styles.leftSide}>
                    <Ionicons color={iconColor} name={iconName} size={24} style={styles.icon} />

                    <Column style={styles.typeColumn}>
                        <AppText style={styles.title} textType="body1">
                            {isSend ? 'Sent' : 'Received'}
                        </AppText>

                        {!isPending && (
                            <AppText textType="caption2">
                                {isError && (
                                    <AppText style={styles.errorCaption} textType="caption2">
                                        Failed{' '}
                                    </AppText>
                                )}
                                {dayjs(transaction.timestamp).format('DD MMM, HH:mm')}
                            </AppText>
                        )}

                        {isPending && <AppText textType="caption2">Processing...</AppText>}
                    </Column>
                </Row>

                <Column style={styles.rightSide}>
                    <AppText style={styles.address} textType="caption2">
                        {formatAddress(transaction.address)}
                    </AppText>

                    {!isError && (
                        <AppText numberOfLines={1} style={styles.balances}>
                            {isSend && (
                                <AppText style={styles.sign} textType="body1">
                                    -
                                </AppText>
                            )}
                            {!isSend && (
                                <AppText style={styles.sign} textType="body1">
                                    +
                                </AppText>
                            )}
                            <TextAmount
                                amount={fromMinorUnit(transaction.amount, 9).toString()}
                                decimals={9}
                                style={styles.cryptoBalance}
                                textType="body1"
                                tokenCode="TON"
                            />
                        </AppText>
                    )}

                    {isError && (
                        <AppText style={styles.balances} textType="caption2">
                            Failed
                        </AppText>
                    )}
                </Column>
            </Block>
        </ActiveTouchAction>
    );
});

TransactionRow.displayName = 'TransactionRow';

const styles = StyleSheet.create(({ colors }) => ({
    container: {
        minHeight: 70,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        paddingVertical: 10,
    },
    leftSide: {
        flex: 1,
        maxWidth: '60%',
        marginRight: 6,
        alignItems: 'center',
    },
    typeColumn: {
        flex: 1,
    },
    rightSide: {
        flex: 1,
        maxWidth: '40%',
        alignItems: 'flex-end',
    },
    icon: {
        marginRight: 10,
    },
    title: {
        color: colors.text.highlight,
        marginBottom: 2,
    },
    address: {
        color: colors.text.secondary,
        textAlign: 'right',
        marginBottom: 2,
    },
    balances: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        textAlign: 'right',
    },
    cryptoBalance: {
        color: colors.text.highlight,
        textAlign: 'right',
    },
    sign: {
        color: colors.text.highlight,
        textAlign: 'right',
    },
    errorCaption: {
        color: colors.error.default,
    },
}));
