"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'chuddster';
exports.version = '0.1.1';
const VOTING_ESCROW = '0x19854C9A5fFa8116f48f984bDF946fB9CEa9B5f7';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function locked(address account) external view returns (int128, uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.address, 'balanceOf', [address]));
    const resultUnlocked = await multi.execute();
    addresses.forEach((address) => multi.call(address, VOTING_ESCROW, 'locked', [address]));
    const resultLocked = await multi.execute();
    return Object.fromEntries(Object.entries(resultUnlocked).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from(balance).add(bignumber_1.BigNumber.from(resultLocked[address][0])), options.decimals))
    ]));
}
exports.strategy = strategy;
