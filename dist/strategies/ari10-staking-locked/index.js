"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'oritwoen';
exports.version = '0.1.0';
const abi = [
    'function userInfo(uint256, address) external view returns (uint256 amount, uint256 lockedAmount)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => multi.call(address, options.address, 'userInfo', [0, address]));
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, info]) => [
        address,
        parseFloat((0, units_1.formatUnits)(info[options.input], 18)) * options.weight
    ]));
}
exports.strategy = strategy;
