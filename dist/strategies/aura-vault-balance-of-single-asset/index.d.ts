export declare const author = "chuddster";
export declare const version = "0.1.0";
interface Params {
    auraVaultDeposit: string;
    tokenIndex: string;
    decimals: string;
}
export declare function strategy(space: any, network: any, provider: any, addresses: any, options: Params, snapshot: any): Promise<Record<string, number>>;
export {};
