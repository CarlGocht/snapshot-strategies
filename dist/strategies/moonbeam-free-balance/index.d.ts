import { JsonRpcProvider } from '@ethersproject/providers';
export declare const author = "crystalin";
export declare const version = "0.1.0";
export declare function readLittleEndianBigInt(hex: string): bigint;
export declare function strategy(space: string, network: string, provider: JsonRpcProvider, addresses: string[], options: {
    decimals: any;
}, snapshot: string | number | undefined): Promise<{
    [k: string]: number;
}>;
