"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'lucid-eleven';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const thresholds = options.thresholds || [{ threshold: 1, votes: 1 }];
    if (thresholds.length == 0)
        thresholds.push({ threshold: 1, votes: 1 });
    const calculateVotes = (balance) => thresholds
        .sort((a, b) => b.threshold - a.threshold)
        .find((t) => t.threshold <= balance)?.votes ?? 0;
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [options.address, 'balanceOf', [address]]), { blockTag });
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        calculateVotes(parseFloat((0, units_1.formatUnits)(value.toString(), options.decimals)))
    ]));
}
exports.strategy = strategy;
