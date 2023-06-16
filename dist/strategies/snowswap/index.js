"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'jairsnowswap';
exports.version = '0.1.0';
const stakedAbi = [
    'function balanceOf(address account) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const { snowStakingAddress, decimals } = options;
    const snowBalances = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const stakedTokenBalances = new utils_1.Multicaller(network, provider, stakedAbi, {
        blockTag
    });
    addresses.forEach((address) => stakedTokenBalances.call(address, snowStakingAddress, 'balanceOf', [
        address
    ]));
    const result = await stakedTokenBalances.execute();
    return Object.fromEntries(Object.entries(result).map(([address, output]) => [
        address,
        parseFloat((0, units_1.formatUnits)(output, decimals)) + snowBalances[address]
    ]));
}
exports.strategy = strategy;
