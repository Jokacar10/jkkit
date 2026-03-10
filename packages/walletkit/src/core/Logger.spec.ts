/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { LogLevel, Logger } from './Logger';

describe('Logger', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('writes logs to stderr in Node runtime by default', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const logger = new Logger({ level: LogLevel.DEBUG, enableTimestamp: false });

        logger.debug('debug message', { foo: 'bar' });
        logger.info('info message');
        logger.warn('warn message');
        logger.error('error message');

        expect(debugSpy).not.toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledTimes(4);
        expect(errorSpy).toHaveBeenNthCalledWith(1, '[TonWalletKit] DEBUG: debug message', { foo: 'bar' });
        expect(errorSpy).toHaveBeenNthCalledWith(2, '[TonWalletKit] INFO: info message');
        expect(errorSpy).toHaveBeenNthCalledWith(3, '[TonWalletKit] WARN: warn message');
        expect(errorSpy).toHaveBeenNthCalledWith(4, '[TonWalletKit] ERROR: error message');
    });

    it('can opt back into console-level output routing', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

        const logger = new Logger({ level: LogLevel.INFO, enableTimestamp: false, output: 'console' });

        logger.info('info message');

        expect(infoSpy).toHaveBeenCalledWith('[TonWalletKit] INFO: info message');
        expect(errorSpy).not.toHaveBeenCalled();
    });
});
