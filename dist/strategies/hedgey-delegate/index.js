"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'hedgey-finance';
exports.version = '1.0.0';
const abi = [
    'function delegatedBalances(address delegate, address token) view returns (uint256 delegatedBalance)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    options.contracts.forEach((contract) => {
        addresses.forEach((address) => multi.call(address, contract, 'delegatedBalances', [
            address,
            options.token
        ]));
    });
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals)) * options.multiplier
    ]));
}
exports.strategy = strategy;
