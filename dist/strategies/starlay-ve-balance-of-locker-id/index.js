"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'wolfwarrier14';
exports.version = '0.1.0';
const abi = [
    'function ownerToId(address) view returns (uint256)',
    'function balanceOfLockerId(uint256 _lockerId) view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.address, 'ownerToId', [address]));
    const locker_id_result = await multi.execute();
    Object.entries(locker_id_result).map(([address, locker_id]) => multi.call(address, options.address, 'balanceOfLockerId', [locker_id]));
    const balance_result = await multi.execute();
    return Object.fromEntries(Object.entries(balance_result).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals))
    ]));
}
exports.strategy = strategy;
