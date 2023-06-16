export declare const author = "crypto-dump";
export declare const version = "0.1.0";
interface StrategyOptions {
    decimals: number;
    tokenAddress: string;
    nftAddress: string;
    nftMultiplier: number;
}
export declare function strategy(space: any, network: any, provider: any, addresses: any, options: StrategyOptions, snapshot: any): Promise<Record<string, number>>;
export {};
