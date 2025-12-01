import { Network } from "./Network";
import { Base64String } from "./Primitives";

export declare type SignDataPayload = {
    network?: Network;
    from?: string;
    value?: SignDataPayloadText | SignDataPayloadBinary | SignDataPayloadCell;
};

export declare type SignDataPayloadBinary = {
    type: 'binary';
    bytes: string;
};

export declare type SignDataPayloadCell = {
    type: 'cell';
    schema: string;
    cell: Base64String;
};

export declare type SignDataPayloadText = {
    type: 'text';
    text: string;
};
