"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'sunrisedao';
exports.version = '0.1.0';
const erc20Abi = [
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address account) view returns (uint256)'
];
const masterChefAbi = [
    'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)'
];
function bn(num) {
    return bignumber_1.BigNumber.from(num.toString());
}
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Get LP balances
    let res = await (0, utils_1.multicall)(network, provider, erc20Abi, [
        [options.lpTokenAddress, 'totalSupply', []],
        [options.tokenAddress, 'balanceOf', [options.lpTokenAddress]],
        ...addresses.map((address) => [
            options.lpTokenAddress,
            'balanceOf',
            [address]
        ])
    ], { blockTag });
    const lpTokenTotalSupply = bn(res[0]); // decimal: 18
    const totalTokensInPool = bn(res[1]); // decimal: options.decimal
    res = res.slice(2);
    // Get staked LP in staking constract
    const stakedRes = await (0, utils_1.multicall)(network, provider, masterChefAbi, [
        ...addresses.map((address) => [
            options.stakingAddress,
            'userInfo',
            [options.poolIndex, address]
        ])
    ], { blockTag });
    // How much tokens user has from LP tokens
    const usersTokensFromLp = res.slice(0, addresses.length).map((amount, i) => {
        const totalLp = bn(amount).add(bn(stakedRes[i].amount)); // decimal: 18
        // (LP + StakedLP) x token.balanceOf(LPToken) / LPToken.totalSupply()
        return totalLp.mul(totalTokensInPool).div(lpTokenTotalSupply); // decimal: options.decimal
    });
    return Object.fromEntries(usersTokensFromLp.map((sum, i) => {
        const parsedSum = parseFloat((0, units_1.formatUnits)(sum, options.decimal));
        return [addresses[i], parsedSum];
    }));
}
exports.strategy = strategy;
