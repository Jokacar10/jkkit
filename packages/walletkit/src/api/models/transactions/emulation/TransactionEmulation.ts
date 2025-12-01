import { 
    Base64String, 
    LogicalTime, 
    Address 
} from "../../core/Primitives";
import { ExtraCurrencies } from "../../core/ExtraCurrencies";
import { TokenAmount } from "../../core/TokenAmount";
import { TokenImage } from "../../core/TokenImage";

export interface TransactionEmulation {
    account: string;
    hash: string;
    logicalTime: LogicalTime;
    now: number;
    mcBlockSeqno: number;
    traceExternalHash: string;
    previousTransactionHash?: string;
    previousTransactionLogicalTime?: LogicalTime;
    origStatus?: AccountStatus | string;
    endStatus?: AccountStatus | string;
    totalFees?: string;
    totalFeesExtraCurrencies?: ExtraCurrencies;
    description?: TransactionDescription;
    blockRef?: TransactionBlockRef;
    inMsg?: TransactionMessage;
    outMsgs: TransactionMessage[];
    accountStateBefore?: AccountState;
    accountStateAfter?: AccountState;
    isEmulated: boolean;
    traceId?: string;
}

export declare enum AccountStatus {
    active = 'active',
    frozen = 'frozen',
    uninit = 'uninit'
}

export interface AccountState {
    hash: string;
    balance: string;
    extraCurrencies?: ExtraCurrencies;
    accountStatus: AccountStatus | string;
    frozenHash?: string;
    dataHash?: string;
    codeHash?: string;
}

export interface TransactionBlockRef {
    /**
     * Workchain ID
     * @format int
     */
    workchain: number;

    /**
     * Shard identifier
     */
    shard: string;

    /**
     * Block sequence number
     * @format uint
     */
    seqno: number;
}

export interface TransactionMessage {
    hash: string;
    source?: string;
    destination?: string;
    value?: string;
    valueExtraCurrencies?: ExtraCurrencies;
    fwdFee?: string;
    ihrFee?: string;
    createdLt?: LogicalTime;
    createdAt?: string;
    opcode?: string;
    ihrDisabled?: boolean;
    isBounce?: boolean;
    isBounced?: boolean;
    importFee?: string;
    messageContent?: TransactionMessageContent;
    initState?: unknown;
    hashNorm?: string;
}

export interface TransactionMessageContent {
    hash: string;
    body: Base64String; // base64-encoded body
    decoded?: unknown;
}

export interface TransactionDescription {
    type: string; // e.g. "ord"
    isAborted: boolean;
    isDestroyed: boolean;
    isCreditFirst: boolean;
    isTock: boolean;
    isInstalled: boolean;
    storagePhase?: TransactionStoragePhase;
    creditPhase?: TransactionCreditPhase;
    computePhase?: TransactionComputePhase;
    action?: TransactionAction;
}

export interface TransactionStoragePhase {
    storageFeesCollected: string;
    statusChange: 'unchanged' | string;
}

export interface TransactionCreditPhase {
    credit: string;
}

export interface TransactionComputePhase {
    isSkipped: boolean;
    isSuccess: boolean;
    isMsgStateUsed: boolean;
    isAccountActivated: boolean;
    gasFees: string;
    gasUsed: string;
    gasLimit: string;
    gasCredit?: string;
    mode: number;
    exitCode: number;
    vmSteps: number;
    vmInitStateHash: string;
    vmFinalStateHash: string;
}

export interface TransactionAction {
    isSuccess: boolean;
    isValid: boolean;
    isNoFunds: boolean;
    statusChange: 'unchanged' | string;
    totalFwdFees?: string;
    totalActionFees?: string;
    resultCode: number;
    totActions: number;
    specActions: number;
    skippedActions: number;
    msgsCreated: number;
    actionListHash: string;
    totMsgSize?: TransactionActionMessageSize;
}

export interface TransactionActionMessageSize {
    cells: string;
    bits: string;
}

export interface TransactionEmulationTraceNode {
    txHash?: string;
    inMsgHash?: string;
    children: TransactionEmulationTraceNode[];
}

export type TransactionEmulationActionType = 'jetton_swap' | 'call_contract' | string;

export interface TransactionEmulationActionBase {
    traceId?: string;
    actionId: string;
    startLt: string;
    endLt: string;
    startUtime: number;
    endUtime: number;
    traceEndLt: string;
    traceEndUtime: number;
    traceMcSeqnoEnd: number;
    transactions: string[]; // list of tx hashes in this action
    success: boolean;
    type: TransactionEmulationActionType;
    traceExternalHash: string;
    accounts: string[];
}

export interface TransactionEmulationJettonSwapDetails {
    dex: string; // e.g. "stonfi"
    sender: Address; // address
    assetIn: string; // jetton master
    assetOut: string; // jetton master
    dexIncomingTransfer?: TransactionEmulationJettonTransfer;
    dexOutgoingTransfer?: TransactionEmulationJettonTransfer;
    peerSwaps: unknown[];
}

export interface TransactionEmulationJettonTransfer {
    asset: string;
    source: Address;
    destination: Address;
    sourceJettonWallet?: Address;
    destinationJettonWallet?: Address;
    amount: TokenAmount;
}

export interface TransactionEmulationCallContractDetails {
    opcode: string;
    source: string;
    destination: string;
    value: string;
    valueExtraCurrencies?: ExtraCurrencies;
}

export interface TransactionEmulationTonTransferDetails {
    source: string;
    destination: string;
    value: string;
    valueExtraCurrencies?: ExtraCurrencies;
    comment?: string | null;
    isEncrypted: boolean;
}

export type TransactionEmulationActionDetails =
    | TransactionEmulationTonTransferDetails
    | TransactionEmulationJettonSwapDetails
    | TransactionEmulationCallContractDetails
    | Record<string, unknown>; // fallback for unknown action types

export interface TransactionEmulationAction extends TransactionEmulationActionBase {
    details: TransactionEmulationActionDetails;
}

// Metadata by address
export interface TransactionEmulationAddressMetadata {
    isIndexed: boolean;
    tokenInfo?: TransactionEmulationTokenInfo[];
}

export type TransactionEmulationTokenInfo =
    | TransactionEmulationTokenInfoJettonWallets
    | TransactionEmulationTokenInfoJettonMasters
    | (TransactionEmulationTokenInfoBase);

export interface TransactionEmulationTokenInfoBase {
    isValid: boolean;
    type: string;
    extra: { [key: string]: unknown };
}

export interface TransactionEmulationTokenInfoJettonWallets extends TransactionEmulationTokenInfoBase {
    type: 'jetton_wallets';
    balance: TokenAmount;
    jetton: Address; // jetton master address
    owner: Address;
}

export interface TransactionEmulationTokenInfoJettonMasters extends TransactionEmulationTokenInfoBase {
    type: 'jetton_masters';
    name: string;
    symbol: string;
    description: string;
    decimalsCount: number;
    image?: TokenImage;
    social: string[];
    uri: string;
    websites: string[];
}