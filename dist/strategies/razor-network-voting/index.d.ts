export declare const author = "razor-network";
export declare const version = "0.1.0";
export declare function getAllData(snapshot: any): Promise<{
    stakers: never[];
    delegators: never[];
}>;
export declare function strategy(space: any, network: any, provider: any, addresses: any[], options: any, snapshot: string): Promise<{}>;