export declare const author = "alberthaotan";
export declare const version = "0.1.0";
interface OwnerToScore {
    [owner: string]: number;
}
export declare function strategy(space: any, network: any, provider: any, addresses: any, options: any, snapshot: any): Promise<OwnerToScore>;
export {};
