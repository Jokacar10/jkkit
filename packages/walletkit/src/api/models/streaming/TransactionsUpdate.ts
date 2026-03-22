/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Transaction } from '../transactions/Transaction';
import type { TransactionAddressMetadata } from '../transactions/TransactionMetadata';
import type { UserFriendlyAddress } from '../core/Primitives';
import type { AddressBookRowV3 } from '../../../types/toncenter/v3/AddressBookRowV3';
import type { StreamingFinality } from './StreamingFinality';
import type { StreamingBaseUpdate } from './StreamingBaseUpdate';

export interface TransactionsUpdate extends StreamingBaseUpdate {
    /** The update type field */
    type: 'transactions';
    /** The account address */
    address: UserFriendlyAddress;
    /** The array of transactions */
    transactions: Transaction[];
    /** The finality of the update */
    finality?: StreamingFinality;
    /** Address book from streaming v2 notification */
    addressBook?: Record<string, AddressBookRowV3>;
    /** Metadata from streaming v2 notification */
    metadata?: TransactionAddressMetadata;
}
