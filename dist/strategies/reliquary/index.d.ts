import { StaticJsonRpcProvider } from '@ethersproject/providers';
export declare const author = "0xSkly";
export declare const version = "0.1.0";
export declare function strategy(space: string, network: string, provider: StaticJsonRpcProvider, addresses: string[], options: {
    reliquaryAddress: string;
    poolId: number;
    minVotingLevel: number;
    maxVotingLevel: number;
    decimals?: number;
    strategy: 'level' | 'multiplier';
    useLevelOnUpdate?: boolean;
}, snapshot?: number | string): Promise<Record<string, number>>;
