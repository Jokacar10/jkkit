/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// Buffer polyfill for @ton/core. Must be imported first in main.tsx.
import { Buffer } from 'buffer';

(globalThis as { Buffer?: typeof Buffer }).Buffer = Buffer;
