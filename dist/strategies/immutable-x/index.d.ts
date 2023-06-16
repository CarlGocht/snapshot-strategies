import { StaticJsonRpcProvider } from '@ethersproject/providers';
export declare const author = "immutable";
export declare const version = "1.0.0";
export declare const name = "immutable-x";
interface Options {
    address: string;
    decimals: number;
    pageSize?: number;
}
export declare function strategy(_space: unknown, network: string, provider: StaticJsonRpcProvider, addresses: string[], options: Options, block?: number | string): Promise<Record<string, number>>;
export {};
