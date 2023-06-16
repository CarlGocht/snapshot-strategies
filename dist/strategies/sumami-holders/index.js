"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'arugulo';
exports.version = '0.1.0';
// Merged ABI for sUMAMI and Marinate contracts
const abi = [
    'function balanceOf(address account) view returns (uint256)',
    'function stakedBalance(address account, uint32 level) view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    if (options.marinateLevels.length > 4) {
        return [];
    }
    const sUmamiBalances = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const marinateBalances = await Promise.all(options.marinateLevels.map((level) => (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.marinateAddress,
        'stakedBalance',
        [address, level],
        { blockTag }
    ]), { blockTag })));
    const totalMarinateBalances = marinateBalances.reduce(
    //@ts-ignore
    (prev, cur) => cur.map((balance, idx) => (prev[idx] || 0) +
        parseFloat((0, units_1.formatUnits)(balance.toString(), options.decimals))), []);
    return Object.fromEntries(Object.entries(sUmamiBalances).map((address, index) => [
        address[0],
        //@ts-ignore
        address[1] + totalMarinateBalances[index]
    ]));
}
exports.strategy = strategy;
