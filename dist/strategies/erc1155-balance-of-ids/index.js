"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'naomsa';
exports.version = '1.0.0';
const abi = [
    'function balanceOfBatch(address[], uint256[]) external view returns (uint256[])'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.address,
        'balanceOfBatch',
        [Array(options.ids.length).fill(address), options.ids]
    ]), { blockTag });
    return Object.fromEntries(response.map((values, i) => [
        addresses[i],
        values[0].reduce((prev, curr) => prev + curr.toNumber(), 0)
    ]));
}
exports.strategy = strategy;
