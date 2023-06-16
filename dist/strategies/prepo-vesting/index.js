"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'prepo-io';
exports.version = '1.0.0';
const abi = [
    'function getAmountAllocated(address _recipient) external view returns (uint256)',
    'function getClaimableAmount(address _recipient) external view returns (uint256)',
    'function getVestedAmount(address _recipient) external view returns (uint256)',
    'function isPaused() external view returns (bool)'
];
const convertBN = (amount, unitName) => parseFloat((0, units_1.formatUnits)(amount, unitName));
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const { address, multiplier } = options;
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((addr) => {
        multi.call(`allocated.${addr}`, address, 'getAmountAllocated', [addr]);
        multi.call(`claimable.${addr}`, address, 'getClaimableAmount', [addr]);
        multi.call(`vested.${addr}`, address, 'getVestedAmount', [addr]);
        multi.call(`isPaused`, address, 'isPaused', []);
    });
    const { allocated, claimable, vested, isPaused } = await multi.execute();
    const output = Object.fromEntries(Object.entries(allocated).map(([address, amountAllocated]) => {
        const unclaimedVestedBalance = convertBN(claimable[address], 18);
        const unvestedBalance = convertBN(bignumber_1.BigNumber.from(amountAllocated).sub(vested[address]), 18);
        const score = isPaused
            ? (unclaimedVestedBalance + unvestedBalance) * multiplier
            : unclaimedVestedBalance + unvestedBalance * multiplier;
        return [address, score];
    }));
    return output;
}
exports.strategy = strategy;
