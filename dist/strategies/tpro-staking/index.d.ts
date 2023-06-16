export declare const author = "tokenomia-pro";
export declare const version = "1.0.0";
interface StrategyOptions {
    address: string;
    symbol: string;
    decimals: number;
    smartContracts: Array<string>;
    contractFactor: Array<number>;
    powerFactor: number;
}
interface VotingPower {
    [key: string]: number;
}
export declare function strategy(space: string, network: string, provider: any, addresses: string[], options: StrategyOptions, snapshot: number): Promise<VotingPower[]>;
export {};
