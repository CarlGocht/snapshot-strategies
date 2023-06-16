"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const erc20_balance_of_1 = require("../erc20-balance-of");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'gp6284';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)'
];
const BWC_ADDRESS = '0xb7F7c7D91Ede27b019e265F8ba04c63333991e02';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const erc20Balance = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [BWC_ADDRESS, 'balanceOf', [address]]), { blockTag });
    return Object.fromEntries(addresses.map((address, i) => [
        address,
        parseFloat((0, units_1.formatUnits)(response[i].toString(), 0)) > 0
            ? Math.floor(erc20Balance[addresses[i]] / (options.weighted || 10000000000))
            : 0
    ]));
}
exports.strategy = strategy;
