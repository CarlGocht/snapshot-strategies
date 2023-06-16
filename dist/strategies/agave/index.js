"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const erc20_balance_of_1 = require("../erc20-balance-of");
const utils_1 = require("../../utils");
exports.author = 'maxaleks';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)',
    'function decimals() external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('availableLiquidity', options.underlyingToken, 'balanceOf', [
        options.lpToken
    ]);
    multi.call('lpTokenTotalSupply', options.lpToken, 'totalSupply');
    multi.call('lpTokenDecimals', options.lpToken, 'decimals');
    multi.call('underlyingTokenDecimals', options.underlyingToken, 'decimals');
    const { availableLiquidity, lpTokenTotalSupply, lpTokenDecimals, underlyingTokenDecimals } = await multi.execute();
    const rate = parseFloat((0, units_1.formatUnits)(availableLiquidity, underlyingTokenDecimals)) /
        parseFloat((0, units_1.formatUnits)(lpTokenTotalSupply, lpTokenDecimals));
    const scores = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, {
        address: options.lpToken,
        decimals: lpTokenDecimals
    }, snapshot);
    return Object.fromEntries(Object.entries(scores).map(([address, balance]) => [
        address,
        balance * rate
    ]));
}
exports.strategy = strategy;
