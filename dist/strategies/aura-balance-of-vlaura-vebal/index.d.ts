export declare const author = "0xButterfield";
export declare const version = "0.1.0";
interface Params {
    auraLocker: string;
    auraVoterProxy: string;
    votingEscrow: string;
}
export declare function strategy(space: any, network: any, provider: any, addresses: any, options: Params, snapshot: any): Promise<Record<string, number>>;
export {};
