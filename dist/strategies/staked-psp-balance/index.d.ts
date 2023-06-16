export declare const author = "paraswap";
export declare const version = "0.1.0";
interface StrategyOptions {
    address: string;
    symbol: string;
    decimals: number;
    SPSPs: string[];
}
export declare function strategy(space: string, network: string, provider: any, addresses: string[], options: StrategyOptions, snapshot: number): Promise<Record<string, number>>;
export {};
