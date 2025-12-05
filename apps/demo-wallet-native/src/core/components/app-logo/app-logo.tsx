/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';
import type { ViewProps } from 'react-native';

import { CircleLogo } from '@/core/components/circle-logo';

interface Props extends ViewProps {
    size?: number;
}

export const AppLogo: FC<Props> = ({ size, ...props }) => {
    return (
        <CircleLogo.Container size={size} {...props}>
            <CircleLogo.Logo size={size} source={require('../../../../assets/logo.png')} />
        </CircleLogo.Container>
    );
};
