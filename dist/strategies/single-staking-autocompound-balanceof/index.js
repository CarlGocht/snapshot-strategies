"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.dependOnOtherAddress = exports.version = exports.author = void 0;
/* eslint-disable prettier/prettier */
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'michaelotis';
exports.version = '0.1.0';
exports.dependOnOtherAddress = false;
const abi = [
    'function userInfo(address) view returns (uint256 shares, uint256 lastDepositedTime, uint256 fuzzAtLastUserAction, uint256 lastUserActionTime)',
    'function getPricePerFullShare() view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.stakingPoolAddress, 'userInfo', [address]));
    const [[[getPricePerFullShare]]] = await Promise.all([
        (0, utils_1.multicall)(network, provider, abi, [[options.stakingPoolAddress, 'getPricePerFullShare', []]], { blockTag })
    ]);
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, userInfo]) => [
        address,
        parseFloat((0, units_1.formatUnits)(userInfo.shares, options.decimals)) * parseFloat((0, units_1.formatUnits)(getPricePerFullShare, options.decimals))
    ]));
}
exports.strategy = strategy;
