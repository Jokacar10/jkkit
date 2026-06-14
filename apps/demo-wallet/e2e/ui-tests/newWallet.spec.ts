/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { expect } from '@playwright/test';

import { testWithUIFixture } from './UITestFixture';
import { TEST_PASSWORD } from '../constants';

const test = testWithUIFixture();

test.describe('New Wallet Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Welcome → "Create a new wallet" → set a password → land on the Recovery phrase screen.
        await page.getByTestId('welcome-create').click();
        await page.getByTestId('password').fill(TEST_PASSWORD);
        await page.getByTestId('password-confirm').fill(TEST_PASSWORD);
        await page.getByTestId('password-submit').click();
        await page.getByTestId('reveal-mnemonic').waitFor({ state: 'visible' });
    });

    test('Create new wallet on Mainnet', async ({ page }) => {
        // Mainnet is selected by default.
        await expect(page.getByTestId('network-select-mainnet')).toBeEnabled();

        await page.getByTestId('reveal-mnemonic').click();

        await expect(page.getByTestId('mnemonic-grid')).toBeVisible();
        await expect(page.getByTestId('mnemonic-word-1')).toBeVisible();

        await page.getByTestId('saved-checkbox').check();
        await page.getByTestId('create-wallet-confirm').click();

        // The settings button only exists on the wallet dashboard.
        await expect(page.getByTestId('wallet-menu')).toBeVisible();
    });

    test('Create new wallet on Testnet', async ({ page }) => {
        await page.getByTestId('network-select-testnet').click();
        await expect(page.getByTestId('network-select-testnet')).toBeEnabled();

        await page.getByTestId('reveal-mnemonic').click();

        await expect(page.getByTestId('mnemonic-grid')).toBeVisible();
        await expect(page.getByTestId('mnemonic-word-1')).toBeVisible();

        await page.getByTestId('saved-checkbox').check();
        await page.getByTestId('create-wallet-confirm').click();

        await expect(page.getByTestId('wallet-menu')).toBeVisible();
    });

    test('Cannot proceed without saving confirmation', async ({ page }) => {
        await page.getByTestId('reveal-mnemonic').click();

        // Continue is disabled until the "I've saved my recovery phrase" box is checked.
        await expect(page.getByTestId('create-wallet-confirm')).toBeDisabled();

        await page.getByTestId('saved-checkbox').check();

        await expect(page.getByTestId('create-wallet-confirm')).toBeEnabled();
    });
});
