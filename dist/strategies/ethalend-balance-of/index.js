"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'ethalend';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function wallets(address account) external view returns (address)'
];
function swapKeys(obj) {
    const newObj = {};
    for (const key in obj) {
        newObj[obj[key]] = key;
    }
    return newObj;
}
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.registry, 'wallets', [address]));
    const resultSmartWallets = await multi.execute();
    addresses.forEach((address) => multi.call(resultSmartWallets[address], options.address, 'balanceOf', [
        resultSmartWallets[address]
    ]));
    const invertedSmartWallets = swapKeys(resultSmartWallets);
    const resultAccounts = await multi.execute();
    return Object.fromEntries(Object.entries(resultAccounts).map(([address, balance]) => [
        invertedSmartWallets[address],
        parseFloat((0, units_1.formatUnits)(balance, options.decimals))
    ]));
}
exports.strategy = strategy;
