"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'Samurai-Legends';
exports.version = '0.2.0';
const abi = [
    'function erc721BatchOwnerOf(address nftAddress, uint idMin, uint idMax) external view returns (address[] memory)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('batch.owners', options.batchAddress, 'erc721BatchOwnerOf', [
        options.nftAddress,
        '0',
        options.treshold.toString()
    ]);
    const result = await multi.execute();
    const balances = result.batch.owners.reduce((prev, curr) => {
        if (curr in prev)
            prev[curr] += 1;
        else
            prev[curr] = 1;
        return prev;
    }, {});
    return Object.fromEntries(addresses.map((address) => {
        const balance = balances[address] || 0;
        return [address, balance * options.multiplier];
    }));
}
exports.strategy = strategy;
