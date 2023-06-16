"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'OccamFi';
exports.version = '0.1.0';
const abi = [
    'function getStake(address user) public view returns (uint stake)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.stakingContractAddress[0], 'getStake', [
        address
    ]));
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, stake]) => [
        address,
        parseFloat((0, units_1.formatUnits)(stake, options.decimals))
    ]));
}
exports.strategy = strategy;
