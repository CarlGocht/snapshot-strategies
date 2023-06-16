"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'MantisClone';
exports.version = '0.1.0';
const abi = [
    'function underlying() public view returns (address)',
    'function decimals() public view returns (uint8)',
    'function exchangeRateStored() public view returns (uint256)',
    'function balanceOf(address owner) external returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    multi.call('underlying', options.fToken, 'underlying', []);
    multi.call('tokenDecimals', options.token, 'decimals', []);
    multi.call('fTokenDecimals', options.fToken, 'decimals', []);
    multi.call('exchangeRate', options.fToken, 'exchangeRateStored', []);
    addresses.forEach((address) => multi.call(`fTokenBalances.${address}`, options.fToken, 'balanceOf', [
        address
    ]));
    const result = await multi.execute();
    const underlying = result.underlying;
    const tokenDecimals = result.tokenDecimals;
    const fTokenDecimals = result.fTokenDecimals;
    const exchangeRate = result.exchangeRate;
    const fTokenBalances = result.fTokenBalances;
    if (options.token !== underlying) {
        throw new Error(`token parameter doesn't match fToken.underlying(). token=${options.token}, underlying=${underlying}`);
    }
    const mantissa = bignumber_1.BigNumber.from(18)
        .add(tokenDecimals)
        .sub(fTokenDecimals);
    const divisor = bignumber_1.BigNumber.from(10).pow(mantissa);
    return Object.fromEntries(Object.entries(fTokenBalances).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance.mul(exchangeRate).div(divisor), fTokenDecimals))
    ]));
}
exports.strategy = strategy;
