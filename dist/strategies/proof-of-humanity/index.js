"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'jaybuidl';
exports.version = '0.1.0';
const abi = [
    'function isRegistered(address _submissionID) external view returns (bool)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.address, 'isRegistered', [address]));
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, registered]) => [
        address,
        Number(registered)
    ]));
}
exports.strategy = strategy;
