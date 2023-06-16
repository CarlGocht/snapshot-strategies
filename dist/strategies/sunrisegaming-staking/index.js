"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'sunrisedao';
exports.version = '0.1.0';
const masterChefAbi = [
    'function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt)'
];
function bn(num) {
    return bignumber_1.BigNumber.from(num.toString());
}
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Get staked LP in staking constract
    const stakedRes = await (0, utils_1.multicall)(network, provider, masterChefAbi, [
        ...addresses.map((address) => [
            options.stakingAddress,
            'userInfo',
            [options.poolIndex, address]
        ])
    ], { blockTag });
    return Object.fromEntries(stakedRes.map((stakedInfo, i) => {
        const parsedAmount = parseFloat((0, units_1.formatUnits)(bn(stakedInfo.amount), options.decimal));
        return [addresses[i], parsedAmount];
    }));
}
exports.strategy = strategy;
