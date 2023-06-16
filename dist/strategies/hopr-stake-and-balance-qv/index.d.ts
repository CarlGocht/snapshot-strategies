/**
 * @dev Calculate score based on Quadratic Voting system.Token balance comes from
 * - Mainnet HOPR token balance, read from multicall
 * - Gnosis chain, HOPR token balance, read from subgraph (xHOPR balance and wxHOPR balance) and multicall (mainnet HOPR balance)
 * - Gnosis chain. HOPR token staked into the most recent stake season, read from subgraph.
 */
export declare const author = "QYuQianchen";
export declare const version = "0.1.0";
export declare function strategy(_space: any, network: any, provider: any, addresses: any, options: any, snapshot: any): Promise<{
    [k: string]: any;
}>;
