/**
 * @dev Calculate score based on Quadratic Voting-like system.
 * Votes should be casted by the admin (owner) account of SafeStake.
 * Token balance comes from
 * - the voter account:
 *   - Mainnet HOPR token balance, read from multicall
 *   - Gnosis chain, HOPR token balance, read from subgraph (xHOPR balance and wxHOPR balance) and multicall (mainnet HOPR balance)
 * - safes created by the "HoprSafeStakeFactory" contract, where the voter account is an owner. Voting account's share of the safe:
 *   - Gnosis chain. Safe's HOPR token balance, read from subgraph (xHOPR balance and wxHOPR balance) and multicall (mainnet HOPR balance)
 *   - Gnosis chain. Safe's HOPR token staked into the production HoprChannels, read from subgraph.
 */
export declare const author = "QYuQianchen";
export declare const version = "0.2.0";
export declare function strategy(_space: any, network: any, provider: any, addresses: any, options: any, snapshot: any): Promise<{
    [k: string]: any;
}>;
