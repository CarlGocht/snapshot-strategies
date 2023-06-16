export declare const author = "mwamedacen";
export declare const version = "0.1.0";
interface Options {
    balancerPoolId: string;
    safetyModule: {
        address: string;
        decimals: number;
    };
    votingToken: {
        address: string;
        decimals: number;
    };
}
export declare function strategy(space: string, network: string, provider: any, addresses: string[], options: Options, snapshot: number): Promise<{
    [k: string]: number;
}>;
export {};
