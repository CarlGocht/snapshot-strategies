"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'TudorSante';
exports.version = '1.0.0';
const erc20ABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const score = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const xROOKTotalSupply = await (0, utils_1.call)(provider, erc20ABI, [options.address, 'totalSupply', []], { blockTag }).then((res) => parseFloat((0, units_1.formatUnits)(res, options.decimals)));
    const liquidityPoolBalance = await (0, utils_1.call)(provider, erc20ABI, [
        options.underlyingTokenAddress,
        'balanceOf',
        [options.liquidityPoolAddress]
    ], { blockTag }).then((res) => parseFloat((0, units_1.formatUnits)(res, options.decimals)));
    const underlyingValue = liquidityPoolBalance / xROOKTotalSupply;
    return Object.fromEntries(Object.entries(score).map((res) => [
        res[0],
        res[1] * options.weight * underlyingValue
    ]));
}
exports.strategy = strategy;
