export declare const author = "morpho-labs";
export declare const version = "0.1.0";
/**
 * @notice This strategy returns the total amount of vested tokens for a given user
 * The particularity of this strategy is the ability to skip the cliff period for the voting power.
 * So if Alice has a vesting line starting on August 2022, with a cliff period of 6 months,
 * a vesting period of 3 years and a total amount of 1000 tokens, she is going to accumulate voting power from August 2022,
 * and in January 2023, she will have 1/6 of the total voting power, i.e. 1000/6 = 166.66 voting power.
 * As a consequence, any voter has its full voting power from the vesting contract 6 month before the end of the vesting period.
 *
 * @notice In order to handle claimed tokens, we are linearizing the amount accumulated and not claimed by the user from the beginning
 * of the vesting power distribution (start - cliff) to the current date, at the rate of the vesting duration.
 * So if Alice is claiming 166 tokens on August 2023 (6 months after the beginning of the distribution), whe are going to have
 * 1000 - 166 = 834 tokens left to linearize from (start - cliff) to August 2023. This is an approximation of the voting power from
 * the vesting amount.
 */
export declare function strategy(space: any, network: any, provider: any, addresses: any, options: any, snapshot: any): Promise<{
    [k: string]: any;
}>;
