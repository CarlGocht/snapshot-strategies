export declare function getDelegations(space: any, network: any, addresses: any, snapshot: any): Promise<{
    [k: string]: any;
}>;
export declare function getDelegationsData(space: any, network: any, addresses: any, snapshot: any): Promise<{
    delegations: {
        [k: string]: any;
    };
    allDelegators: any[];
}>;
