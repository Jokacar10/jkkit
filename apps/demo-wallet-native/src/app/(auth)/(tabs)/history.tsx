/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { type FC, useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { RowCenter } from '@/core/components/grid';
import { InfoBlock } from '@/core/components/info-block';
import { LoaderCircle } from '@/core/components/loader-circle';
import { ScreenHeader } from '@/core/components/screen-header';
import { noop } from '@/core/utils/noop';
import { loadTransactions, TransactionList, useTransactionsStore } from '@/features/transactions';

const HistoryScreen: FC = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const transactions = useTransactionsStore((state) => state.transactions);
    const isInitialized = useTransactionsStore((state) => state.isInitialized);

    const { theme } = useUnistyles();

    const onRefresh = useCallback(async () => {
        try {
            setIsRefreshing(true);
            await loadTransactions().catch(noop);
            setIsRefreshing(false);
        } catch (_e) {
            setIsRefreshing(false);
        }
    }, []);

    return (
        <TransactionList
            contentContainerStyle={styles.list}
            ListHeaderComponent={
                <>
                    <ScreenHeader.Container>
                        <ScreenHeader.Title>Transactions</ScreenHeader.Title>
                    </ScreenHeader.Container>

                    {!isInitialized && (
                        <RowCenter style={styles.loaderContainer}>
                            <LoaderCircle size={64} />
                        </RowCenter>
                    )}

                    {isInitialized && !transactions.length && (
                        <InfoBlock.Container style={styles.infoBlock}>
                            <InfoBlock.IconWrapper>
                                <InfoBlock.Icon color={theme.colors.text.inverted} name="reader" withWrapper />
                            </InfoBlock.IconWrapper>

                            <InfoBlock.Title>No transactions yet</InfoBlock.Title>
                            <InfoBlock.Subtitle style={styles.infoSubtitle}>
                                You haven't made any transactions so far. Once you do, they'll appear here.
                            </InfoBlock.Subtitle>
                        </InfoBlock.Container>
                    )}
                </>
            }
            refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isRefreshing} />}
            style={styles.container}
        />
    );
};

export default HistoryScreen;

const styles = StyleSheet.create(({ sizes }, runtime) => ({
    container: {
        marginTop: runtime.insets.top,
        marginLeft: runtime.insets.left,
        marginRight: runtime.insets.right,
    },
    list: {
        paddingTop: sizes.page.paddingTop,
        paddingBottom: sizes.page.paddingBottom,
        paddingHorizontal: sizes.page.paddingHorizontal,
    },
    loaderContainer: {
        marginTop: 60,
    },
    infoBlock: {
        paddingVertical: 60,
    },
    infoSubtitle: {
        marginBottom: 0,
        maxWidth: 'auto',
    },
}));
