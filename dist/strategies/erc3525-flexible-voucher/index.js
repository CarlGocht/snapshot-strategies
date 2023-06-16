"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bytes_1 = require("@ethersproject/bytes");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const utils_2 = require("./utils");
exports.author = 'buchaoqun';
exports.version = '0.1.2';
const abi = [
    'function getSnapshot(uint256 tokenId) view returns (tuple(tuple(address issuer, uint8 claimType, uint64 startTime, uint64 latestStartTime, uint64[] terms, uint32[] percentages, bool isValid), uint256 tokenId, uint256 vestingAmount))',
    'function balanceOf(address owner) view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner,uint256 index) view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // flexible voucher banlanceOf
    const callWalletToCrucibleCount = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const walletAddress of addresses) {
        callWalletToCrucibleCount.call(walletAddress, options.address, 'balanceOf', [walletAddress]);
    }
    // wallet Owner Index
    const walletToCrucibleCount = await callWalletToCrucibleCount.execute();
    const callWalletToCrucibleAddresses = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletAddress, crucibleCount] of Object.entries(walletToCrucibleCount)) {
        for (let index = 0; index < crucibleCount.toNumber(); index++) {
            callWalletToCrucibleAddresses.call(walletAddress.toString() + '-' + index.toString(), options.address, 'tokenOfOwnerByIndex', [walletAddress, index]);
        }
    }
    const walletIDToCrucibleAddresses = await callWalletToCrucibleAddresses.execute();
    // voucher snapshot
    const callCrucibleToSnapshot = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    // walletID: walletAddress-index
    for (const [walletID, crucibleAddress] of Object.entries(walletIDToCrucibleAddresses)) {
        callCrucibleToSnapshot.call(walletID, options.address, 'getSnapshot', [
            (0, bytes_1.hexZeroPad)(crucibleAddress.toHexString(), 20)
        ]);
    }
    const walletIDToSnapshot = await callCrucibleToSnapshot.execute();
    const walletToWeights = {};
    for (const [walletID, snapshot] of Object.entries(walletIDToSnapshot)) {
        const address = walletID.split('-')[0];
        const value = parseFloat((0, units_1.formatUnits)(snapshot[2].toString(), options.decimals)) *
            (0, utils_2.claimCoefficient)(snapshot[0][1]) *
            (0, utils_2.maturitiesCoefficient)(snapshot[0][2] == 0
                ? snapshot[0][3].toNumber()
                : snapshot[0][2].toNumber(), snapshot[0][4]);
        walletToWeights[address] = walletToWeights[address]
            ? walletToWeights[address] + value
            : value;
    }
    return Object.fromEntries(Object.entries(walletToWeights).map(([address, balance]) => [
        address,
        balance
    ]));
}
exports.strategy = strategy;
