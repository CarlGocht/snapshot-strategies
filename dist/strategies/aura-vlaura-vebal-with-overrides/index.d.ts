export declare const author = "0xMaharishi";
export declare const version = "0.1.0";
interface Options {
    auraLocker: string;
    auraVoterProxy: string;
    votingEscrow: string;
    includeSnapshotDelegations?: boolean;
    delegationSpace?: string;
}
export declare function strategy(space: any, network: any, provider: any, addresses: any, options: Options, snapshot: any): Promise<Record<string, number>>;
export {};
