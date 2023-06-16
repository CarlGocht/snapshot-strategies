"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'OfficialDevTeamSix';
exports.version = '0.1.0';
const abi = [
    'function balanceOfAt(address account, uint256 snapshotId) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options) {
    const multi = new utils_1.Multicaller(network, provider, abi);
    addresses.forEach((address) => multi.call(address, options.address, 'balanceOfAt', [
        address,
        options.snapshotId
    ]));
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.decimals))
    ]));
}
exports.strategy = strategy;
