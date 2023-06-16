import { StaticJsonRpcProvider } from '@ethersproject/providers';
export declare const author = "dannyposi";
export declare const version = "0.0.1";
declare type Params = {
    symbol: string;
    decimals: number;
};
export declare function strategy(_space: string, network: string, provider: StaticJsonRpcProvider, addresses: Array<string>, options: Params, snapshot: number | string): Promise<{
    [x: string]: number;
}>;
export {};
