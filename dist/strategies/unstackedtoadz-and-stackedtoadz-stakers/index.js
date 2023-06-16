"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'Eh-Marine';
exports.version = '0.1.0';
const stakingAbi = [
    'function depositsOf(address account) external view  returns (uint256[] memory)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stacked_stakingPool = new utils_1.Multicaller(network, provider, stakingAbi, {
        blockTag
    });
    const unstacked_stakingPool = new utils_1.Multicaller(network, provider, stakingAbi, {
        blockTag
    });
    addresses.forEach((address) => {
        stacked_stakingPool.call(address, options.staking_stackedtoadz, 'depositsOf', [address]);
        unstacked_stakingPool.call(address, options.staking_unstackedtoadz, 'depositsOf', [address]);
    });
    const [stakingResponse_stacked, stackingResponse_unstacked] = await Promise.all([
        stacked_stakingPool.execute(),
        unstacked_stakingPool.execute()
    ]);
    return Object.fromEntries(addresses.map((address) => {
        const stakingCount_stacked = stakingResponse_stacked[address].length;
        const stakingCount_unstacked = stackingResponse_unstacked[address].length;
        return [address, stakingCount_stacked + stakingCount_unstacked];
    }));
}
exports.strategy = strategy;
