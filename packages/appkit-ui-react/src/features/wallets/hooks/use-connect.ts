/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useMutation } from '@tanstack/react-query';
import type { UseMutationResult, UseMutationOptions } from '@tanstack/react-query';
import { connectMutationOptions } from '@ton/appkit/queries';
import type { ConnectParameters, ConnectReturnType } from '@ton/appkit/queries';

import { useAppKit } from '../../../hooks/use-app-kit';

export type UseConnectParameters = Omit<
    UseMutationOptions<ConnectReturnType, Error, ConnectParameters>,
    'mutationFn' | 'mutationKey'
>;

export type UseConnectReturnType = UseMutationResult<ConnectReturnType, Error, ConnectParameters> & {
    connect: UseMutationResult<ConnectReturnType, Error, ConnectParameters>['mutate'];
    connectAsync: UseMutationResult<ConnectReturnType, Error, ConnectParameters>['mutateAsync'];
};

export function useConnect(parameters: UseConnectParameters = {}): UseConnectReturnType {
    const appKit = useAppKit();
    const mutationOptions = connectMutationOptions(appKit);
    const mutation = useMutation({
        ...mutationOptions,
        ...parameters,
    });

    return {
        ...mutation,
        connect: mutation.mutate,
        connectAsync: mutation.mutateAsync,
    };
}
