/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Address } from '@ton/ton';
import { router } from 'expo-router';
import { type FC, useState } from 'react';
import { Alert, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AmountInput } from '@/core/components/amount-input';
import { AppButton } from '@/core/components/app-button';
import { AppInput } from '@/core/components/app-input';
import { AppText } from '@/core/components/app-text';
import { AppKeyboardAwareScrollView } from '@/core/components/keyboard-aware-scroll-view';
import { ScreenHeader } from '@/core/components/screen-header';
import { getErrorMessage } from '@/core/utils/errors/get-error-message';
import { validateAmount } from '@/core/utils/validators/validate-amount';
import { useBalancesStore } from '@/features/balances';
import { sendJetton, sendTon, TokenListSheet, TokenSelector, useSendTransactionStore } from '@/features/send';

const SendScreen: FC = () => {
    const [showTokenSelector, setShowTokenSelector] = useState(false);

    const selectedToken = useSendTransactionStore((state) => state.selectedToken);
    const recipient = useSendTransactionStore((state) => state.recipient);
    const amount = useSendTransactionStore((state) => state.amount);
    const isSending = useSendTransactionStore((state) => state.isSending);
    const tonBalance = useBalancesStore((state) => state.tonBalance);

    const handleSend = async () => {
        if (!recipient.trim()) {
            Alert.alert('Error', 'Please enter recipient address');
            return;
        }

        if (!selectedToken) {
            Alert.alert('Error', 'Please select token');
            return;
        }

        const balance = selectedToken === 'TON' ? tonBalance : selectedToken.balance;
        const decimals = selectedToken === 'TON' ? 9 : selectedToken.decimals;

        try {
            validateAmount(amount, balance, decimals);
        } catch (_err) {
            Alert.alert('Error', 'Invalid amount');
            return;
        }

        if (!Address.isFriendly(recipient)) {
            Alert.alert('Error', 'Invalid address');
            return;
        }

        try {
            if (selectedToken === 'TON') {
                await sendTon();
            } else {
                await sendJetton(selectedToken);
            }

            Alert.alert('Success', 'Transaction sent successfully');
            router.back();
        } catch (err) {
            Alert.alert('Error', getErrorMessage(err, 'Failed to send transaction'));
        }
    };

    const getTokenSymbol = () => {
        if (selectedToken === 'TON') return 'TON';
        return selectedToken?.symbol || '';
    };

    const setAmount = (text: string) => useSendTransactionStore.setState({ amount: text.replace(',', '.') });

    return (
        <AppKeyboardAwareScrollView contentContainerStyle={styles.containerContent} style={styles.container}>
            <ScreenHeader.Container>
                <ScreenHeader.LeftSide>
                    <ScreenHeader.BackButton />
                </ScreenHeader.LeftSide>
                <ScreenHeader.Title>Send {getTokenSymbol()}</ScreenHeader.Title>
            </ScreenHeader.Container>

            <TokenSelector onSelectToken={() => setShowTokenSelector(true)} />

            <AmountInput.Container style={styles.amountInput}>
                <AmountInput.WithTicker amount={amount} onChangeAmount={setAmount} ticker={getTokenSymbol()} />

                <AmountInput.Percents
                    amount={amount}
                    balance={selectedToken === 'TON' ? tonBalance : selectedToken?.balance}
                    onChangeAmount={setAmount}
                />
            </AmountInput.Container>

            <View>
                <AppText style={styles.addressLabel} textType="caption1">
                    Recipient Address
                </AppText>

                <AppInput
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect={false}
                    onChangeText={(text) => useSendTransactionStore.setState({ recipient: text })}
                    placeholder="EQ..."
                    style={styles.addressInput}
                    value={recipient}
                />
            </View>

            <AppButton.Container
                colorScheme="primary"
                disabled={isSending || !recipient || !amount}
                onPress={handleSend}
            >
                <AppButton.Text>{isSending ? 'Sending...' : 'Send'}</AppButton.Text>
            </AppButton.Container>

            <TokenListSheet isOpen={showTokenSelector} onClose={() => setShowTokenSelector(false)} />
        </AppKeyboardAwareScrollView>
    );
};

export default SendScreen;

const styles = StyleSheet.create(({ sizes, colors }, runtime) => ({
    container: {
        marginTop: runtime.insets.top,
        marginLeft: runtime.insets.left,
        marginRight: runtime.insets.right,
        paddingHorizontal: sizes.page.paddingHorizontal,
    },
    containerContent: {
        paddingTop: sizes.page.paddingTop,
        paddingBottom: runtime.insets.bottom + sizes.page.paddingBottom,
    },
    addressInput: {
        backgroundColor: colors.background.main,
        borderBottomWidth: 1,
        borderBottomColor: colors.navigation.default,
        paddingVertical: sizes.space.vertical,
        marginBottom: sizes.space.vertical * 2,
    },
    addressLabel: {
        color: colors.text.secondary,
    },
    amountInput: {
        paddingVertical: sizes.space.vertical * 3,
        gap: sizes.space.vertical / 2,
        marginTop: sizes.space.vertical,
        marginBottom: sizes.space.vertical * 2,
    },
}));
