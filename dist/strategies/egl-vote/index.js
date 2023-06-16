"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'shanevc';
exports.version = '0.1';
const lockedTokenBalance = [
    'function voters(address) view returns (uint8,uint16,uint256,uint256,uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const { eglVotingAddress, decimals } = options;
    const eglBalances = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const lockedTokenBalances = new utils_1.Multicaller(network, provider, lockedTokenBalance, { blockTag });
    addresses.forEach((address) => lockedTokenBalances.call(address, eglVotingAddress, 'voters', [address]));
    const result = await lockedTokenBalances.execute();
    return Object.fromEntries(Object.entries(result).map(([address, voter]) => [
        address,
        parseFloat((0, units_1.formatUnits)(voter[3], decimals)) + eglBalances[address]
    ]));
}
exports.strategy = strategy;
