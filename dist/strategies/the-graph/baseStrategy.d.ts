import { Provider } from '@ethersproject/providers';
import { GraphAccountScores, GraphStrategyOptions, StrategyFunction } from './graphUtils';
/**
 * Fetch scores for a list of addresses and their token-locked wallets
 *
 * @export
 * @param {string} _space snapshot space
 * @param {string} network networkId (i.e. ethereum mainnet = '1')
 * @param {Provider} _provider
 * @param {string[]} addresses
 * @param {GraphStrategyOptions} options
 * @param {(string | number)} snapshot 'latest' or blockNumber
 * @param {StrategyFunction} graphStrategy
 * @return {Promise<GraphAccountScores>} scores
 */
export declare function getScoresPage(_space: string, network: string, _provider: Provider, addresses: string[], options: GraphStrategyOptions, snapshot: string | number, graphStrategy: StrategyFunction): Promise<GraphAccountScores>;
export declare function baseStrategy(_space: string, network: string, _provider: Provider, _addresses: string[], options: GraphStrategyOptions, snapshot: string | number, graphStrategy: StrategyFunction): Promise<{
    [k: string]: number;
}>;
