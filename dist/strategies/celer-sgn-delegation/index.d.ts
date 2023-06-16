import { Provider } from '@ethersproject/providers';
export declare const author = "dominator008";
export declare const version = "0.2.0";
export declare function strategy(space: string, network: string, provider: Provider, addresses: string[], options: {
    v1StakingAddress: string;
    v2StakingViewerAddress: string;
}, snapshot: string | number): Promise<{}>;
