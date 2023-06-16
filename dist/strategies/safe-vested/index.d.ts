export declare const author = "dasanra";
export declare const version = "0.2.0";
declare type Options = {
    allocationsSource: string;
    claimDateLimit: string | undefined;
};
export declare function strategy(space: string, network: string, provider: any, addresses: string[], options: Options, snapshot?: number | string): Promise<{}>;
export {};
