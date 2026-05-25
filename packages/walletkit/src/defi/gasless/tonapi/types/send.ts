/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/**
 * Wire-format request body for `POST /v2/gasless/send`.
 * See https://docs.tonapi.io/tonapi/rest-api/gasless.
 */
export interface TonApiGaslessSendRequest {
    wallet_public_key: string;
    boc: string;
}

/**
 * Wire-format response from `POST /v2/gasless/send` (TonAPI `GaslessTx`).
 *
 * `external` is the TEP-467 normalized hash of the external message the relayer
 * broadcasted. Optional in the schema; required field is `protocol_name`.
 */
export interface TonApiGaslessSendResponse {
    external?: string;
    protocol_name: string;
}
