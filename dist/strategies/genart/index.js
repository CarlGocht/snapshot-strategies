"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'stzky';
exports.version = '0.2.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function getMembershipsOf(address account) external view returns (uint256[] memory)',
    'function getStake(address user) external view returns (uint256,uint256[] memory,uint256,uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multiMembership = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    const multiToken = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    const multiStake = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    addresses.forEach((address) => multiMembership.call(address, options.interfaceAddress, 'getMembershipsOf', [address]));
    addresses.forEach((address) => multiToken.call(address, options.tokenAddress, 'balanceOf', [address]));
    addresses.forEach((address) => multiStake.call(address, options.vaultAddress, 'getStake', [address]));
    const members = await multiMembership.execute();
    const tokens = await multiToken.execute();
    const stakes = await multiStake.execute();
    return Object.fromEntries(Object.entries(tokens).map(([address, balance]) => [
        address,
        (Number((0, units_1.formatUnits)(balance, options.decimals)) +
            Number((0, units_1.formatUnits)(stakes[address][0], options.decimals))) *
            (members[address].length > 0 ? 1 : 0)
    ]));
}
exports.strategy = strategy;
