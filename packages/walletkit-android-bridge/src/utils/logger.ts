/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Flexible logging utility for the Android WalletKit bridge.
 *
 * Logging can be controlled by setting the log level from the Android SDK:
 * window.__WALLETKIT_LOG_LEVEL__ = 'DEBUG'; // OFF, ERROR, WARN, INFO, DEBUG
 *
 * Default is 'OFF' in production for performance.
 */

/**
 * Log levels in order of verbosity
 */
export enum LogLevel {
    OFF = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
}

type LogLevelString = 'OFF' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

type LogWindow = Window & { __WALLETKIT_LOG_LEVEL__?: LogLevelString };

type ConsoleLike = {
    log?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
};

const logWindow = window as LogWindow;
const consoleRef = (globalThis as { console?: ConsoleLike }).console;

/**
 * Get the current log level from window
 */
function getCurrentLogLevel(): LogLevel {
    const levelStr = logWindow.__WALLETKIT_LOG_LEVEL__ || 'OFF';
    return LogLevel[levelStr] ?? LogLevel.OFF;
}

/**
 * Debug logger - logs detailed debugging information
 * Only logs when level is DEBUG or higher
 */
export const log = (...args: unknown[]): void => {
    if (getCurrentLogLevel() >= LogLevel.DEBUG) {
        consoleRef?.log?.('[WalletKit]', ...args);
    }
};

/**
 * Info logger - logs informational messages
 * Only logs when level is INFO or higher
 */
export const info = (...args: unknown[]): void => {
    if (getCurrentLogLevel() >= LogLevel.INFO) {
        consoleRef?.log?.('[WalletKit]', ...args);
    }
};

/**
 * Warning logger - logs warnings
 * Only logs when level is WARN or higher
 */
export const warn = (...args: unknown[]): void => {
    if (getCurrentLogLevel() >= LogLevel.WARN) {
        consoleRef?.warn?.('[WalletKit]', ...args);
    }
};

/**
 * Error logger - logs errors
 * Only logs when level is ERROR or higher
 */
export const error = (...args: unknown[]): void => {
    if (getCurrentLogLevel() >= LogLevel.ERROR) {
        consoleRef?.error?.('[WalletKit]', ...args);
    }
};
