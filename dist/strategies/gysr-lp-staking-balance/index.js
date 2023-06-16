"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'mitesh-mutha';
exports.version = '0.0.1';
const tokenABI = [
    'function balanceOf(address account) view returns (uint256)',
    'function totalSupply() view returns (uint256)'
];
const poolABI = [
    'function stakingBalances(address user) external view returns (uint256[])',
    'function stakingTokens() external view returns (address[])'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Fetch pool -> get lp token address
    const poolCallResult = await (0, utils_1.multicall)(network, provider, poolABI, [[options.pool, 'stakingTokens', []]], { blockTag });
    const lpTokenAddress = poolCallResult[0][0][0];
    // Fetch balances from lp token
    const callResult = await (0, utils_1.multicall)(network, provider, tokenABI, [
        [lpTokenAddress, 'totalSupply', []],
        [options.tokenAddress, 'balanceOf', [lpTokenAddress]]
    ], { blockTag });
    const totalSupply = callResult[0];
    const rewardTokenBalance = callResult[1];
    const rewardTokensPerLP = rewardTokenBalance / 10 ** options.decimals / (totalSupply / 1e18);
    // Fetch balances
    const balanceResult = await (0, utils_1.multicall)(network, provider, poolABI, addresses.map((address) => [
        options.pool,
        'stakingBalances',
        [address]
    ]), { blockTag });
    // Final result
    return Object.fromEntries(balanceResult.map((value, i) => [
        addresses[i],
        (value / 10 ** options.decimals) * rewardTokensPerLP
    ]));
}
exports.strategy = strategy;
