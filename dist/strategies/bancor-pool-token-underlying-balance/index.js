"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'TudorSante';
exports.version = '1.0.0';
const erc20ABI = [
    'function poolToken(address pool) external view returns (address)',
    'function poolTokenToUnderlying(address pool, uint256 poolTokenAmount) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const liquidityPoolTokenAddress = await (0, utils_1.call)(provider, erc20ABI, [
        options.bancorNetworkInfoAddress,
        'poolToken',
        [options.underlyingTokenAddress]
    ], { blockTag });
    options.address = liquidityPoolTokenAddress;
    const scores = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const poolTokenDecimalScaling = (10 ** options.decimals).toString();
    const underlyingValue = await (0, utils_1.call)(provider, erc20ABI, [
        options.bancorNetworkInfoAddress,
        'poolTokenToUnderlying',
        [options.underlyingTokenAddress, poolTokenDecimalScaling]
    ], { blockTag }).then((res) => parseFloat((0, units_1.formatUnits)(res, options.decimals)));
    return Object.fromEntries(Object.entries(scores).map((res) => [res[0], res[1] * underlyingValue]));
}
exports.strategy = strategy;
