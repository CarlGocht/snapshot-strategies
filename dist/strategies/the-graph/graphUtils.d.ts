import { BigNumber } from '@ethersproject/bignumber';
import { Provider } from '@ethersproject/providers';
export declare const GRAPH_NETWORK_SUBGRAPH_URL: {
    '1': string;
    '4': string;
};
export declare const bnWEI: BigNumber;
export interface GraphAccountScores {
    [key: string]: number;
}
export declare type GraphStrategyOptions = {
    symbol: string;
    strategyType: string;
    pageSize?: number;
    skip?: number;
    expectedResults?: Record<string, any>;
};
export declare type StrategyFunction = (space: string, network: string, provider: Provider, addresses: string[], options: GraphStrategyOptions, snapshot: string | number) => Promise<Record<string, number>>;
/**
 * Pass in a BigDecimal and BigNumber from a subgraph query, and return the multiplication of
 * them as a BigNumber
 * */
export declare function bdMulBn(bd: string, bn: string): BigNumber;
export declare function calcNonStakedTokens(totalSupply: string, totalTokensStaked: string, totalDelegatedTokens: string): number;
export declare function verifyResults(result: string, expectedResults: string, type: string): void;
/**
 * splits an array in even chunks and returns a list of chunks
 *
 * @export
 * @param {string[]} _array
 * @param {number} pageSize
 * @return {string[][]} chunks
 */
export declare function splitArray(_array: string[], pageSize: number): string[][];
