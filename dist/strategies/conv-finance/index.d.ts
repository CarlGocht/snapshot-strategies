export declare const author = "eric-convergence";
export declare const version = "0.1.0";
interface STRATEGY_OPTIONS {
    address: string;
    symbol: string;
    decimals: number;
    lpTokenAddresses: string[];
    stakingPools: STAKING_POOL[];
    stakingPoolsVersion: string;
    rewarder: REWARDER[];
    rewarderVersion: string;
}
interface STAKING_POOL {
    address: string;
    pools: STAKING_POOL_INFO[];
}
interface STAKING_POOL_INFO {
    poolId: string;
    rewarderIdx?: string;
}
interface REWARDER {
    address: string;
    poolIds: number[];
}
export declare function strategy(_space: any, network: any, provider: any, addresses: any, options: STRATEGY_OPTIONS, snapshot: any): Promise<any>;
export {};
