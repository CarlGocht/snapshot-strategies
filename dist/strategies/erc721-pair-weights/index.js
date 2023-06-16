"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'arpitkarnatak';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const calls = [];
    options.registries.slice(0, 2).forEach((registry) => {
        addresses.forEach((address) => {
            calls.push([registry, 'balanceOf', [address]]);
        });
    });
    const response = await (0, utils_1.multicall)(network, provider, abi, calls, { blockTag });
    const merged = {};
    response.map((value, i) => {
        const address = calls[i][2][0];
        const registry = calls[i][0];
        merged[registry] = merged[registry] || {};
        merged[registry][address] = merged[registry][address] ?? 0;
        merged[registry][address] += parseFloat((0, units_1.formatUnits)(value.toString(), 0));
    });
    const powers = {};
    addresses.forEach((address) => {
        const balance0 = merged[options.registries[0]][address] ?? 0;
        const balance1 = merged[options.registries[1]][address] ?? 0;
        const pairCount = Math.min(balance0, balance1);
        const votePower = pairCount * options.pairWeight +
            (balance0 - pairCount) * options.weights[0] +
            (balance1 - pairCount) * options.weights[1];
        powers[address] = votePower;
    });
    return powers;
}
exports.strategy = strategy;
