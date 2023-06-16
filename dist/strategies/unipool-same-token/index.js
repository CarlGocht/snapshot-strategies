"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'dapplion';
exports.version = '0.1.0';
// Merged ABIs from below contracts:
// * Unipool contract from @k06a: https://github.com/k06a/Unipool/blob/master/contracts/Unipool.sol
const contractAbi = [
    'function balanceOf(address account) view returns (uint256)',
    'function earned(address account) view returns (uint256)'
];
function bn(num) {
    return bignumber_1.BigNumber.from(num.toString());
}
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const res = await (0, utils_1.multicall)(network, provider, contractAbi, [
        ...addresses.map((address) => [
            options.unipoolAddress,
            'balanceOf',
            [address]
        ]),
        ...addresses.map((address) => [
            options.unipoolAddress,
            'earned',
            [address]
        ])
    ], { blockTag });
    // Balance of staked tokens in unipool contract per user
    const unipoolBalanceOf = res.slice(0, addresses.length).map((num) => {
        return bn(num); // decimal: 18
    });
    // Earned tokens from unipool contract per user
    const unipoolEarned = res.slice(addresses.length).map((num) => {
        return bn(num); // decimal: options.decimal
    });
    const sumList = unipoolBalanceOf.map((userBalanceOf, i) => {
        return userBalanceOf.add(unipoolEarned[i]);
    });
    return Object.fromEntries(sumList.map((sum, i) => {
        const parsedSum = parseFloat((0, units_1.formatUnits)(sum, options.decimal));
        return [addresses[i], parsedSum];
    }));
}
exports.strategy = strategy;
