"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'capitaldao';
exports.version = '0.1.0';
const masterChefAbi = [
    'function users(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 lastDepositAt)'
];
function bn(num) {
    return bignumber_1.BigNumber.from(num.toString());
}
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Get staked LP in staking contract
    const response = await (0, utils_1.multicall)(network, provider, masterChefAbi, [
        ...addresses.map((address) => [
            options.stakingAddress,
            'users',
            [options.poolIndex, address]
        ])
    ], { blockTag });
    return Object.fromEntries(response.map((user, i) => {
        const parsedAmount = parseFloat((0, units_1.formatUnits)(bn(user.amount), options.decimal));
        return [addresses[i], parsedAmount];
    }));
}
exports.strategy = strategy;
