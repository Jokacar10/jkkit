/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Redirect } from 'expo-router';
import type { FC } from 'react';

const Index: FC = () => <Redirect href="/(auth)/wallet" />;

export default Index;
