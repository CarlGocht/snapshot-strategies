interface Delegation {
    in: string[];
    out: string | null;
}
export declare function getVp(address: string, network: string, strategies: any[], snapshot: number | 'latest', space: string, delegation?: boolean): Promise<{
    vp: number;
    vp_by_strategy: number[];
    vp_state: string;
}>;
export declare function getDelegationsOut(addresses: string[], network: string, snapshot: number | 'latest', space: string): Promise<any>;
export declare function getDelegationOut(address: string, network: string, snapshot: number | 'latest', space: string): Promise<string | null>;
export declare function getDelegationsIn(address: string, network: string, snapshot: number | 'latest', space: string): Promise<string[]>;
export declare function getDelegations(address: string, network: string, snapshot: number | 'latest', space: string): Promise<Delegation>;
export {};
