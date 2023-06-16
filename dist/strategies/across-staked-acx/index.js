"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'nicholaspai';
exports.version = '0.1.0';
/**
 * @notice This strategy returns the voting power of an address that has staked ACX-LP tokens in the
 * AcceleratingDistributor contract. The voting power is calculated as the amount of staked ACX-LP
 * tokens multiplied by the current exchange rate of ACX-LP to ACX. Outstanding rewards denominated
 * in ACX are also added to voting power.
 */
const abi = [
    'function getUserStake(address stakedToken, address account) view returns (tuple(uint256 cumulativeBalance, uint256 averageDepositTime, uint256 rewardsAccumulatedPerToken, uint256 rewardsOutstanding))',
    'function getOutstandingRewards(address stakedToken, address account) view returns (uint256)',
    'function pooledTokens(address) view returns (address lpToken, bool isEnabled, uint32 lastLpFeeUpdate, int256 utilizedReserves, uint256 liquidReserves, uint256 undistributedLpFees)',
    'function totalSupply() view returns (uint256)'
];
const acxLpTokensDecimals = 18;
const oneUnitAcxLp = (0, units_1.parseUnits)('1', acxLpTokensDecimals);
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const response = await (0, utils_1.multicall)(network, provider, abi, [
        [options.hubPoolAddress, 'pooledTokens', [options.acxTokenAddress]],
        [options.acxLpTokenAddress, 'totalSupply', []],
        ...addresses.map((address) => [
            options.acceleratingDistributorAddress,
            'getUserStake',
            [options.acxLpTokenAddress, address]
        ]),
        ...addresses.map((address) => [
            options.acceleratingDistributorAddress,
            'getOutstandingRewards',
            [options.acxLpTokenAddress, address]
        ]),
        ...addresses.map((address) => [
            options.acceleratingDistributorAddress,
            'getOutstandingRewards',
            [options.wethLpTokenAddress, address]
        ]),
        ...addresses.map((address) => [
            options.acceleratingDistributorAddress,
            'getOutstandingRewards',
            [options.usdcLpTokenAddress, address]
        ]),
        ...addresses.map((address) => [
            options.acceleratingDistributorAddress,
            'getOutstandingRewards',
            [options.wbtcLpTokenAddress, address]
        ]),
        ...addresses.map((address) => [
            options.acceleratingDistributorAddress,
            'getOutstandingRewards',
            [options.daiLpTokenAddress, address]
        ])
    ], { blockTag });
    const pooledTokens = response[0];
    const acxLpTokenSupply = response[1][0];
    const userStake = response.slice(2, 2 + addresses.length);
    const outstandingAcxLpRewards = response.slice(2 + addresses.length, 2 + addresses.length * 2);
    const outstandingWethLpRewards = response.slice(2 + addresses.length * 2, 2 + addresses.length * 3);
    const outstandingUsdcLpRewards = response.slice(2 + addresses.length * 3, 2 + addresses.length * 4);
    const outstandingWbtcLpRewards = response.slice(2 + addresses.length * 4, 2 + addresses.length * 5);
    const outstandingDaiLpRewards = response.slice(2 + addresses.length * 5, 2 + addresses.length * 6);
    // This is the latest exchange rate as of the last HubPool._sync call.
    // This computation is based off of this math:
    // - https://github.com/across-protocol/contracts-v2/blob/e911cf59ad3469e19f04f5de1c92d6406c336042/contracts/HubPool.sol#L944
    // (liquidReserves + utilizedReserves - undistributedLpFees) / acxLpTokenSupply
    const lastExchangeRate = pooledTokens.liquidReserves
        .add(pooledTokens.utilizedReserves)
        .sub(pooledTokens.undistributedLpFees)
        .mul(oneUnitAcxLp)
        .div(acxLpTokenSupply);
    // Convert staked ACX-LP balances to underlying by multiplying by ACX-LP:ACX token exchange rate.
    // Note: Each UserStake object is stored on-chain as a tuple with the staked balance being the first element.
    const stakedLpBalances = userStake.map((value) => value[0][0].mul(lastExchangeRate).div(oneUnitAcxLp));
    // !!Note: This will break if the reward currency doesn't use same decimals as the staked LP token.
    // Add outstanding ACX rewards to staked balance values. This assumes that the reward
    // currency ACX is the same unit as the staked ACX-LP's underlying.
    const stakedBalancesPlusRewards = Object.fromEntries(addresses.map((address, i) => [
        address,
        parseFloat((0, units_1.formatUnits)(stakedLpBalances[i]
            .add(outstandingAcxLpRewards[i][0])
            .add(outstandingWethLpRewards[i][0])
            .add(outstandingUsdcLpRewards[i][0])
            .add(outstandingWbtcLpRewards[i][0])
            .add(outstandingDaiLpRewards[i][0])
            .toString(), acxLpTokensDecimals))
    ]));
    return stakedBalancesPlusRewards;
}
exports.strategy = strategy;
