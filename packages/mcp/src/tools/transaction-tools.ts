/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { z } from 'zod';

import type { McpWalletService } from '../services/McpWalletService.js';
import type { ToolResponse } from './types.js';

export const getTransactionStatusSchema = z.object({
    boc: z.string().min(1).describe('Transaction BOC (Base64 string)'),
});

export function createMcpTransactionTools(service: McpWalletService) {
    return {
        get_transaction_status: {
            description: 'Get the status of a transaction by its BOC to know if it is pending, completed, or failed.',
            inputSchema: getTransactionStatusSchema,
            handler: async (args: z.infer<typeof getTransactionStatusSchema>): Promise<ToolResponse> => {
                try {
                    const result = await service.getTransactionStatus(args.boc);

                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify(result, null, 2),
                            },
                        ],
                    };
                } catch (error) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text: JSON.stringify({
                                    success: false,
                                    error: `Failed to get transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`,
                                }),
                            },
                        ],
                        isError: true,
                    };
                }
            },
        },
    };
}
