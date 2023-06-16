export declare const author = "deversifi";
export declare const version = "0.1.0";
export declare const examples: {
    name: string;
    strategy: {
        name: string;
        params: {
            symbol: string;
            api: string;
            token: string;
        };
    };
    network: string;
    addresses: string[];
    snapshot: number;
}[];
export declare function strategy(space: any, network: any, provider: any, addresses: any, options: any, snapshot: any): Promise<{
    [k: string]: any;
}>;
