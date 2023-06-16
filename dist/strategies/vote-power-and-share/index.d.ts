export declare const author = "jinanton";
export declare const version = "0.1.0";
declare enum PowerType {
    VotingPower = "votingPower",
    ShareOfTotalSupply = "shareOfTotalSupply"
}
interface Options {
    address: string;
    decimals: number;
    symbol: string;
    powerType: PowerType;
}
export declare function strategy(space: any, network: any, provider: any, addresses: any, options: Options, snapshot: any): Promise<{
    [k: string]: number;
}>;
export {};
