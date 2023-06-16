"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = '0xfoobar';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function exchangeRate() external view returns (uint256)',
    'function exchangeRatePrecision() external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('exchangeRate', options.wrapperAddress, 'exchangeRate');
    multi.call('exchangeRatePrecision', options.wrapperAddress, 'exchangeRatePrecision');
    const { exchangeRate, exchangeRatePrecision } = await multi.execute();
    const rate = parseFloat(exchangeRate) / parseFloat(exchangeRatePrecision);
    addresses.forEach((address) => multi.call(address, options.wrapperAddress, 'balanceOf', [address]));
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals)) * rate
    ]));
}
exports.strategy = strategy;
