"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'stakedotlink';
exports.version = '0.0.1';
const abi = [
    'function balanceOf(address _account) public view returns (uint256)',
    'function totalBalanceOf(address _account) public view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.address, 'balanceOf', [address]));
    const balanceResult = await multi.execute();
    addresses.forEach((address) => multi.call(address, options.address, 'totalBalanceOf', [address]));
    const totalBalanceResult = await multi.execute();
    return Object.fromEntries(Object.entries(balanceResult).map(([address, balance]) => {
        const vestingBalance = parseFloat((0, units_1.formatUnits)(totalBalanceResult[address], options.decimals)) -
            parseFloat((0, units_1.formatUnits)(balance, options.decimals));
        return [address, vestingBalance];
    }));
}
exports.strategy = strategy;
