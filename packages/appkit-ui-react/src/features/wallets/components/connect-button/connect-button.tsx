/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC, ComponentProps } from 'react';
import clsx from 'clsx';

import styles from './connect-button.module.css';
import { Button } from '../../../../components/button';
import { useSelectedWallet } from '../../hooks/use-selected-wallet';
import { useConnectors } from '../../hooks/use-connectors';
import { useConnect } from '../../hooks/use-connect';
import { useDisconnect } from '../../hooks/use-disconnect';

type ConnectButtonProps = Omit<ComponentProps<'button'>, 'onClick' | 'children'>;

export const ConnectButton: FC<ConnectButtonProps> = ({ className, ...props }) => {
    const [selectedWallet] = useSelectedWallet();
    const connectors = useConnectors();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    const onClick = () => {
        if (selectedWallet) {
            // const connector = connectors.find((c) => c.id === selectedWallet.connectorId);
            const connector = connectors[0];

            if (!connector) {
                return;
            }

            disconnect({ connectorId: connector.id });
            return;
        }

        if (connectors.length === 1 && connectors[0]) {
            connect({ connectorId: connectors[0].id });
            return;
        }

        // TODO open provider selection
    };

    return (
        <Button className={clsx(styles.connectButton, className)} onClick={onClick} {...props}>
            {selectedWallet ? selectedWallet.getAddress() : 'Connect'}
        </Button>
    );
};
