"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'gerrrg';
exports.version = '0.0.1';
const abi = [
    'function getInternalBalance(address user, address[] tokens) external view returns (uint256[] balances)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.vault, 'getInternalBalance', [
        address,
        [options.token]
    ]));
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance[0], options.decimals))
    ]));
}
exports.strategy = strategy;
