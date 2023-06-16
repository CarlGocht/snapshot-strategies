"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
/* eslint-disable prettier/prettier */
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'PolySwift';
exports.version = '0.1.0';
const singleStakingPoolAbi = [
    'function userInfo(address) view returns (uint256 amount, uint256 rewardDebt)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, singleStakingPoolAbi, { blockTag });
    options.stakingPoolAddresses.forEach(stakingPoolAddress => {
        addresses.forEach((address) => multi.call(address, stakingPoolAddress, 'userInfo', [address]));
    });
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, userInfo]) => [
        address,
        parseFloat((0, units_1.formatUnits)(userInfo.amount, options.decimals))
    ]));
}
exports.strategy = strategy;
