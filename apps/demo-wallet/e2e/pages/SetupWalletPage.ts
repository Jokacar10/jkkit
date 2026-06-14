/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Page } from '@playwright/test';

/**
 * The screen reached right after setting a password for the "create" path —
 * the redesigned "Recovery phrase" (create-wallet) screen.
 */
export class SetupWalletPage {
    constructor(private readonly page: Page) {}

    get revealButton() {
        return this.page.getByTestId('reveal-mnemonic');
    }

    async waitForPage() {
        await this.revealButton.waitFor({ state: 'visible' });
    }
}
