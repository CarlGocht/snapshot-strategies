export declare const author = "flushjb";
export declare const version = "0.1.0";
declare type VotingPowers = Record<string, number>;
export declare function strategy(space: any, network: any, provider: any, addresses: string[], options: any, snapshot: any): Promise<VotingPowers>;
export {};
