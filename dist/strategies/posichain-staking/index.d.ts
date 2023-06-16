import { StaticJsonRpcProvider } from '@ethersproject/providers';
export declare const author = "dannyposi";
export declare const version = "0.0.1";
declare type Params = {
    symbol: string;
    decimals: number;
};
export declare function strategy(_space: string, _network: string, provider: StaticJsonRpcProvider, _addresses: Array<string>, options: Params, snapshot: number | string): Promise<{
    [k: string]: number;
}>;
export {};
