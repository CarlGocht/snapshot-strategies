"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'chrisjgf';
exports.version = '0.0.1';
const abi = ['function getVotes(address account) view returns (uint256)'];
const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stkMTAQuery = addresses.map((address) => [
        options.stkMTA,
        'getVotes',
        [address]
    ]);
    const stkBPTQuery = addresses.map((address) => [
        options.stkBPT,
        'getVotes',
        [address]
    ]);
    const response = await (0, utils_1.multicall)(network, provider, abi, [...stkMTAQuery, ...stkBPTQuery], { blockTag });
    const chunks = chunk(response, addresses.length);
    const stkMTABalances = chunks[0];
    const stkBPTBalances = chunks[1];
    return Object.fromEntries(Array(addresses.length)
        .fill('x')
        .map((_, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(stkMTABalances[i][0].add(stkBPTBalances[i][0]).toString(), 18))
    ]));
}
exports.strategy = strategy;
