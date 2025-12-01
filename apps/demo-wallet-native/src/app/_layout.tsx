/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot } from 'expo-router';
import type { FC } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useUnistyles } from 'react-native-unistyles';

import { AppWrapper } from '@/features/settings';
import { AppToastProvider } from '@/features/toasts';

import '@/core/libs/unistyles';
import 'react-native-reanimated';

const RootLayout: FC = () => {
    const { theme } = useUnistyles();

    return (
        <GestureHandlerRootView>
            <KeyboardProvider>
                <BottomSheetModalProvider>
                    <ThemeProvider
                        value={{
                            ...DefaultTheme,
                            colors: {
                                ...DefaultTheme.colors,
                                background: theme.colors.background.main,
                            },
                        }}
                    >
                        <AppWrapper>
                            <Slot />
                            <AppToastProvider />
                        </AppWrapper>
                    </ThemeProvider>
                </BottomSheetModalProvider>
            </KeyboardProvider>
        </GestureHandlerRootView>
    );
};

export default RootLayout;
