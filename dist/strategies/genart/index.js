"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'stzky';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multiMembership = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    const multiToken = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    addresses.forEach((address) => multiMembership.call(address, options.membershipAddress, 'balanceOf', [
        address
    ]));
    const members = await multiMembership.execute();
    addresses.forEach((address) => multiToken.call(address, options.tokenAddress, 'balanceOf', [address]));
    const result = await multiToken.execute();
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals)) *
            (Number(members[address].toString()) > 0 ? 1 : 0)
    ]));
}
exports.strategy = strategy;
