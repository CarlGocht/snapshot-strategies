import { Provider } from '@ethersproject/providers';
import { GraphAccountScores, GraphStrategyOptions } from '../the-graph/graphUtils';
export declare function delegatorsStrategy(_space: string, network: string, _provider: Provider, addresses: string[], options: GraphStrategyOptions, snapshot: string | number): Promise<GraphAccountScores>;
