"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'manes-codes';
exports.version = '1.0.0';
const abi = [
    'function sharesOf(address account) view returns (uint256)',
    'function getPricePerFullShare() view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const queries = [];
    addresses.forEach((voter) => {
        queries.push([options.address, 'sharesOf', [voter]]);
    });
    queries.push([options.address, 'getPricePerFullShare']);
    const response = (await (0, utils_1.multicall)(network, provider, abi, queries, { blockTag })).map((r) => r[0]);
    const sharePrice = response[response.length - 1];
    return Object.fromEntries(Array(addresses.length)
        .fill('x')
        .map((_, i) => {
        const balanceBN = response[i].mul(sharePrice).div((0, units_1.parseUnits)('1', 18));
        return [addresses[i], parseFloat((0, units_1.formatUnits)(balanceBN, 18))];
    }));
}
exports.strategy = strategy;
