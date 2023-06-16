"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'foxthefarmer';
exports.version = '0.0.1';
const vaultAbi = ['function wantLockedTotal(address) view returns (uint256)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const vaultBalancesCalls = (0, utils_1.multicall)(network, provider, vaultAbi, addresses.map((address) => [
        options.vaultAddress,
        'wantLockedTotal',
        [address]
    ]), { blockTag });
    const vaultBalances = await Promise.all([vaultBalancesCalls]);
    return Object.fromEntries(Object.entries(addresses).map((address, index) => [
        address[1],
        parseFloat((0, units_1.formatUnits)(vaultBalances[0][index].toString(), 18))
    ]));
}
exports.strategy = strategy;
