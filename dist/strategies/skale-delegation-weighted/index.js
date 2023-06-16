"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'payvint';
exports.version = '1.0.0';
const abi = [
    'function getAndUpdateDelegatedAmount(address wallet) external returns (uint)',
    'function getEscrowAddress(address beneficiary) external view returns (address)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => {
        multi.call(address, options.addressSKL, 'getAndUpdateDelegatedAmount', [
            address
        ]);
    });
    const resultAccounts = await multi.execute();
    console.log(resultAccounts);
    const escrowAddressCallsQuery = addresses.map((address) => [
        options.addressAllocator,
        'getEscrowAddress',
        [address]
    ]);
    const escrowAddressesFromAccount = await (0, utils_1.multicall)(network, provider, abi, [...escrowAddressCallsQuery], {
        blockTag
    });
    const addressToEscrow = new Map();
    addresses.forEach((address, index) => {
        addressToEscrow[address] = escrowAddressesFromAccount[index][0];
    });
    addresses.forEach((address) => {
        multi.call(address, options.addressSKL, 'getAndUpdateDelegatedAmount', [
            addressToEscrow[address]
        ]);
    });
    const resultEscrows = await multi.execute();
    return Object.fromEntries(Object.entries(resultAccounts).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(bignumber_1.BigNumber.from(balance).add(bignumber_1.BigNumber.from(resultEscrows[address]))))
    ]));
}
exports.strategy = strategy;
