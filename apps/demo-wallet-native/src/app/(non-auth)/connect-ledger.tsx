/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import type { FC } from 'react';
import { Alert, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { router } from 'expo-router';
import { useAuth, useWallet } from '@ton/demo-core';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppButton } from '@/core/components/app-button';
import { AppText } from '@/core/components/app-text';
import { ScreenHeader } from '@/core/components/screen-header';
import { ScreenWrapper } from '@/core/components/screen-wrapper';
import { LoaderCircle } from '@/core/components/loader-circle';
import { getErrorMessage } from '@/core/utils/errors/get-error-message';
import {
    useLedgerConnection,
    DeviceList,
    ScanningIndicator,
    LedgerInstructions,
    LedgerSettings,
} from '@/features/ledger';
import type { LedgerDevice } from '@/features/ledger';

const LEDGER_DEVICE_ID_KEY = 'ledger_device_id';

type ScreenState = 'instructions' | 'scanning' | 'configure' | 'connecting';

const ConnectLedgerScreen: FC = () => {
    const [screenState, setScreenState] = useState<ScreenState>('instructions');
    const [selectedDevice, setSelectedDevice] = useState<LedgerDevice | null>(null);
    const [network, setNetwork] = useState<'mainnet' | 'testnet'>('testnet');
    const [accountNumber, setAccountNumber] = useState(0);
    const [, setIsCreatingWallet] = useState(false);

    const { theme } = useUnistyles();
    const { setUseWalletInterfaceType, setLedgerAccountNumber } = useAuth();
    const { createLedgerWallet } = useWallet();

    const handleDeviceConnected = useCallback(async (device: LedgerDevice) => {
        // Save device ID for future reconnections
        await AsyncStorage.setItem(LEDGER_DEVICE_ID_KEY, device.id);
    }, []);

    const {
        status,
        devices,
        error: connectionError,
        startScan,
        stopScan,
        connect,
        disconnect,
    } = useLedgerConnection({
        onDeviceConnected: handleDeviceConnected,
    });

    const handleStartScan = useCallback(async () => {
        setScreenState('scanning');
        await startScan();
    }, [startScan]);

    const handleStopScan = useCallback(() => {
        stopScan();
        if (devices.length === 0) {
            setScreenState('instructions');
        }
    }, [stopScan, devices.length]);

    const handleDeviceSelect = useCallback(
        async (device: LedgerDevice) => {
            try {
                setSelectedDevice(device);
                await connect(device);
                setScreenState('configure');
            } catch (err) {
                Alert.alert('Connection Failed', getErrorMessage(err));
                setSelectedDevice(null);
            }
        },
        [connect],
    );

    const handleCreateWallet = useCallback(async () => {
        if (!selectedDevice) {
            Alert.alert('Error', 'No device selected');
            return;
        }

        try {
            setScreenState('connecting');
            setIsCreatingWallet(true);

            // Set wallet interface type to ledger
            setUseWalletInterfaceType('ledger');
            setLedgerAccountNumber(accountNumber);

            // Disconnect current connection first - BLE can only have one connection at a time
            await disconnect();

            // Wait for BLE to fully close the connection before reopening
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Create the Ledger wallet (will open new connection via createLedgerTransport)
            await createLedgerWallet(undefined, network);

            // Navigate to wallet
            router.replace('/(auth)/(tabs)/wallet');
        } catch (err) {
            const errorMessage = getErrorMessage(err);

            // Provide more helpful error messages for common Ledger errors
            if (errorMessage.includes('0x6d02') || errorMessage.includes('UNKNOWN_APDU')) {
                Alert.alert(
                    'TON App Not Open',
                    'Please make sure the TON application is open on your Ledger device and try again.',
                );
            } else if (errorMessage.includes('0x6985') || errorMessage.includes('denied')) {
                Alert.alert('Action Cancelled', 'The action was cancelled on the Ledger device.');
            } else {
                Alert.alert('Error', errorMessage);
            }

            setScreenState('configure');
        } finally {
            setIsCreatingWallet(false);
        }
    }, [
        selectedDevice,
        network,
        accountNumber,
        setUseWalletInterfaceType,
        setLedgerAccountNumber,
        disconnect,
        createLedgerWallet,
    ]);

    const handleBack = useCallback(() => {
        if (screenState === 'scanning') {
            handleStopScan();
            setScreenState('instructions');
        } else if (screenState === 'configure') {
            disconnect();
            setSelectedDevice(null);
            setScreenState('scanning');
            startScan();
        } else {
            router.back();
        }
    }, [screenState, handleStopScan, disconnect, startScan]);

    const renderContent = () => {
        switch (screenState) {
            case 'instructions':
                return (
                    <>
                        <LedgerInstructions />
                        <View style={styles.buttonContainer}>
                            <AppButton.Container colorScheme="primary" onPress={handleStartScan}>
                                <AppButton.Text>Start Scanning</AppButton.Text>
                            </AppButton.Container>
                        </View>
                    </>
                );

            case 'scanning':
                return (
                    <>
                        <ScanningIndicator isScanning={status === 'scanning'} />
                        <DeviceList
                            devices={devices}
                            onDevicePress={handleDeviceSelect}
                            connectingDeviceId={status === 'connecting' ? selectedDevice?.id : undefined}
                        />
                        {connectionError && <AppText style={styles.errorText}>{connectionError}</AppText>}
                        <View style={styles.buttonContainer}>
                            <AppButton.Container
                                colorScheme="secondary"
                                onPress={status === 'scanning' ? handleStopScan : handleStartScan}
                            >
                                <AppButton.Text>
                                    {status === 'scanning' ? 'Stop Scanning' : 'Scan Again'}
                                </AppButton.Text>
                            </AppButton.Container>
                        </View>
                    </>
                );

            case 'configure':
                return (
                    <>
                        <View style={styles.connectedDevice}>
                            <AppText style={styles.connectedLabel}>Connected to</AppText>
                            <AppText style={styles.connectedName}>{selectedDevice?.name}</AppText>
                        </View>
                        <LedgerSettings
                            network={network}
                            onNetworkChange={setNetwork}
                            accountNumber={accountNumber}
                            onAccountNumberChange={setAccountNumber}
                        />
                        <View style={styles.warningBox}>
                            <Ionicons name="warning-outline" size={20} color={theme.colors.warning.foreground} />
                            <AppText style={styles.warningText}>
                                Make sure the TON app is open on your Ledger device before continuing
                            </AppText>
                        </View>
                        <View style={styles.buttonContainer}>
                            <AppButton.Container colorScheme="primary" onPress={handleCreateWallet}>
                                <AppButton.Text>Create Wallet</AppButton.Text>
                            </AppButton.Container>
                        </View>
                    </>
                );

            case 'connecting':
                return (
                    <View style={styles.loadingContainer}>
                        <LoaderCircle size={60} color={theme.colors.accent.primary} />
                        <AppText style={styles.loadingText}>Creating wallet...</AppText>
                        <AppText style={styles.loadingHint}>Please confirm on your Ledger device if prompted</AppText>
                    </View>
                );
        }
    };

    return (
        <ScreenWrapper>
            <ScreenHeader.Container>
                <ScreenHeader.LeftSide>
                    <ScreenHeader.BackButton onPress={handleBack} />
                </ScreenHeader.LeftSide>
                <ScreenHeader.Title>Connect Ledger</ScreenHeader.Title>
            </ScreenHeader.Container>

            <View style={styles.content}>
                <View style={styles.header}>
                    <AppText style={styles.subtitle}>
                        {screenState === 'instructions' && 'Connect your Ledger hardware wallet via Bluetooth'}
                        {screenState === 'scanning' && 'Select your Ledger device from the list below'}
                        {screenState === 'configure' && 'Configure your wallet settings'}
                        {screenState === 'connecting' && 'Setting up your wallet'}
                    </AppText>
                </View>

                {renderContent()}
            </View>
        </ScreenWrapper>
    );
};

export default ConnectLedgerScreen;

const styles = StyleSheet.create(({ sizes, colors }) => ({
    content: {
        flex: 1,
        paddingTop: sizes.space.vertical,
        paddingBottom: sizes.space.vertical * 2,
        gap: sizes.space.vertical * 2,
    },
    header: {
        gap: sizes.space.vertical,
    },
    subtitle: {
        color: colors.text.secondary,
        lineHeight: 20,
    },
    buttonContainer: {
        marginTop: sizes.space.vertical,
    },
    errorText: {
        color: colors.error.default,
        textAlign: 'center',
        fontSize: 14,
    },
    connectedDevice: {
        padding: sizes.space.horizontal,
        backgroundColor: colors.success.default + '20',
        borderRadius: sizes.borderRadius.medium,
        alignItems: 'center',
        gap: 4,
    },
    connectedLabel: {
        color: colors.text.secondary,
        fontSize: 12,
    },
    connectedName: {
        color: colors.success.foreground,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizes.space.vertical,
        paddingVertical: sizes.space.vertical * 4,
    },
    loadingText: {
        color: colors.text.highlight,
        fontWeight: '500',
        fontSize: 16,
    },
    loadingHint: {
        color: colors.text.secondary,
        textAlign: 'center',
        fontSize: 14,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sizes.space.horizontal,
        padding: sizes.space.horizontal,
        backgroundColor: colors.warning.default + '20',
        borderRadius: sizes.borderRadius.medium,
        borderWidth: 1,
        borderColor: colors.warning.default + '40',
    },
    warningText: {
        flex: 1,
        color: colors.warning.foreground,
        fontSize: 13,
        lineHeight: 18,
    },
}));
