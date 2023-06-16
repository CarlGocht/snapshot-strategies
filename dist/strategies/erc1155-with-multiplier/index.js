"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'fabianschu';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address owner, uint256 id) view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const multiplier = options.multiplier || 1;
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.address,
        'balanceOf',
        [address, options.tokenId]
    ]), { blockTag });
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value.toString(), options.decimals)) * multiplier
    ]));
}
exports.strategy = strategy;
