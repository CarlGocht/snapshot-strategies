import { Provider } from '@ethersproject/providers';
import { GraphAccountScores, GraphStrategyOptions } from '../the-graph/graphUtils';
export declare type Curator = {
    id: string;
    signals: Signal[];
    nameSignals: NameSignal[];
};
export declare type Signal = {
    signal: string;
    subgraphDeployment: SubgraphDeployment;
};
export declare type NameSignal = {
    signal: string;
    nameSignal: string;
    subgraph: Subgraph;
};
export declare type SubgraphDeployment = {
    id: string;
    signalledTokens: string;
    signalAmount: string;
};
export declare type Subgraph = {
    id: string;
    withdrawableTokens: string;
    currentSignalledTokens: string;
    signalAmount: string;
    nameSignalAmount: string;
    currentVersion: {
        subgraphDeployment: SubgraphDeployment;
    };
};
export declare const ETH_IN_WEI = 1000000000000000000;
export declare function getCuratorSignalledGRT(curator: Curator): number;
export declare function balanceStrategy(_space: string, network: string, _provider: Provider, addresses: string[], _options: GraphStrategyOptions, snapshot: string | number): Promise<GraphAccountScores>;
