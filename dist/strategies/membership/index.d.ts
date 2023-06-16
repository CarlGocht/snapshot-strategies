export declare const author = "blakewest";
export declare const version = "1.0.0";
export declare function strategy(space: any, network: any, provider: any, addresses: any, options: {
    name: string;
    membershipStrategy: {
        name: string;
        params: Record<string, string | number | boolean>;
    };
    votingPowerStrategy: {
        name: string;
        params: Record<string, string | number | boolean>;
    };
}, snapshot: any): Promise<any>;
