export declare const author = "fextr";
export declare const version = "1.0.1";
interface StrategyOptions {
    address: string;
    decimals: number;
    lpPriceDecimals: number;
    curvePoolAddress: string;
    fraxStakingAddress: string;
    blackListAddresses: string[];
}
export declare function strategy(space: any, network: any, provider: any, addresses: string[], options: StrategyOptions, snapshot: any): Promise<Record<string, number>>;
export {};
