import { BigNumberish } from '@ethersproject/bignumber';
export declare const author = "paraswap";
export declare const version = "0.1.0";
interface StrategyOptions {
    address: string;
    symbol: string;
    decimals: number;
    sePSP2: {
        address: string;
        decimals: number;
    };
    balancer: {
        poolId: string;
        BalancerHelpers: string;
        Vault: string;
    };
    multiplier: number;
}
export declare function strategy(space: string, network: string, provider: any, addresses: string[], options: StrategyOptions, snapshot: number): Promise<Record<string, number>>;
interface ExitPoolRequest {
    assets: string[];
    minAmountsOut: BigNumberish[];
    userData: string;
    toInternalBalance: boolean;
}
export declare function constructExitPoolRequest(assets: string[], bptAmountIn: BigNumberish): ExitPoolRequest;
export {};
