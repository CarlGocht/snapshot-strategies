import { StaticJsonRpcProvider } from '@ethersproject/providers';
export declare const author = "carlosfebres";
export declare const version = "1.0.1";
export declare function strategy(space: string, network: string, provider: StaticJsonRpcProvider, addresses: string[], options: any, snapshot: number | 'latest'): Promise<Record<string, number>>;
