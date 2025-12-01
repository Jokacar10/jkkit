/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useBalancesStore } from '../../store/store';

import { AppText } from '@/core/components/app-text';
import { Block } from '@/core/components/block';
import { CircleLogo } from '@/core/components/circle-logo';
import { TextAmount } from '@/core/components/text-amount';

export const JettonList: FC = () => {
    const jettonBalances = useBalancesStore((state) => state.jettonBalances);
    const isInitialized = useBalancesStore((state) => state.isInitialized);

    if (!isInitialized) {
        return (
            <View style={styles.container}>
                <AppText style={styles.sectionTitle} textType="h3">
                    Jettons
                </AppText>
                <Block>
                    <AppText style={styles.emptyText}>Loading...</AppText>
                </Block>
            </View>
        );
    }

    if (jettonBalances.length === 0) {
        return (
            <View style={styles.container}>
                <AppText style={styles.sectionTitle} textType="h3">
                    Jettons
                </AppText>
                <Block>
                    <AppText style={styles.emptyText}>No jettons found</AppText>
                </Block>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppText style={styles.sectionTitle} textType="h3">
                Jettons
            </AppText>

            <Block>
                {jettonBalances.map((jetton) => {
                    return (
                        <View key={jetton.address}>
                            <View style={styles.jettonItem}>
                                <View style={styles.jettonInfo}>
                                    {jetton.image ? (
                                        <CircleLogo.Container>
                                            <CircleLogo.Logo source={{ uri: jetton.image }} />
                                        </CircleLogo.Container>
                                    ) : (
                                        <View style={styles.jettonImagePlaceholder}>
                                            <AppText style={styles.jettonImagePlaceholderText}>
                                                {jetton.symbol.charAt(0)}
                                            </AppText>
                                        </View>
                                    )}

                                    <View style={styles.jettonDetails}>
                                        <AppText style={styles.jettonName}>{jetton.name}</AppText>
                                        <AppText style={styles.jettonSymbol}>{jetton.symbol}</AppText>
                                    </View>
                                </View>

                                <View style={styles.jettonBalance}>
                                    <TextAmount
                                        amount={jetton.balance}
                                        decimals={jetton.decimals}
                                        style={styles.jettonBalanceAmount}
                                    />
                                    <AppText style={styles.jettonBalanceSymbol}>{jetton.symbol}</AppText>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </Block>
        </View>
    );
};

const styles = StyleSheet.create(({ sizes, colors }) => ({
    container: {
        gap: sizes.space.vertical,
    },
    sectionTitle: {
        color: colors.text.highlight,
        textAlign: 'center',
    },
    emptyText: {
        color: colors.text.secondary,
        textAlign: 'center',
        fontSize: 14,
    },
    jettonItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: sizes.space.vertical / 4,
    },
    jettonInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.space.horizontal / 2,
        flex: 1,
    },
    jettonImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    jettonImagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.navigation.default,
        justifyContent: 'center',
        alignItems: 'center',
    },
    jettonImagePlaceholderText: {
        color: colors.text.highlight,
        fontSize: 18,
        fontWeight: '600',
    },
    jettonDetails: {
        flex: 1,
        gap: sizes.space.vertical / 4,
    },
    jettonName: {
        color: colors.text.highlight,
        fontSize: 16,
        fontWeight: '500',
    },
    jettonSymbol: {
        color: colors.text.secondary,
        fontSize: 12,
    },
    jettonBalance: {
        alignItems: 'flex-end',
        gap: sizes.space.vertical / 4,
    },
    jettonBalanceAmount: {
        color: colors.text.highlight,
        fontSize: 16,
        fontWeight: '600',
    },
    jettonBalanceSymbol: {
        color: colors.text.secondary,
        fontSize: 12,
    },
    divider: {
        height: 1,
        backgroundColor: colors.navigation.default,
        marginVertical: sizes.space.vertical / 2,
    },
}));
