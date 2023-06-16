export declare const author = "gawainb";
export declare const version = "1.1.0";
export declare const examples: {
    name: string;
    strategy: {
        name: string;
        params: {
            symbol: string;
            tokenIds: {
                id: string;
                weight: number;
            }[];
        };
    };
    network: string;
    addresses: string[];
    snapshot: number;
}[];
export declare function strategy(_space: any, network: any, _provider: any, addresses: any, options: any, snapshot: any): Promise<any>;
