"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'gregegan';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // First, get the balance of the token
    const callWalletToBalanceOf = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const walletAddress of addresses) {
        callWalletToBalanceOf.call(walletAddress, options.address, 'balanceOf', [
            walletAddress
        ]);
    }
    const walletToBalanceOf = await callWalletToBalanceOf.execute();
    // Second, get the tokenId's for each token
    const callWalletToAddresses = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletAddress, count] of Object.entries(walletToBalanceOf)) {
        for (let index = 0; index < count.toNumber(); index++) {
            callWalletToAddresses.call(walletAddress.toString() + '-' + index.toString(), options.address, 'tokenOfOwnerByIndex', [walletAddress, index]);
        }
    }
    const walletIDToAddresses = await callWalletToAddresses.execute();
    // Third, sum the weights for each tokenId by finding it's range
    const walletToLpBalance = {};
    for (const [walletID, tokenId] of Object.entries(walletIDToAddresses)) {
        const address = walletID.split('-')[0];
        let tokenIdValue = options.defaultWeight;
        for (const { start, end, weight } of options.tokenIdWeightRanges) {
            if (tokenId.toNumber() >= start && tokenId.toNumber() <= end) {
                tokenIdValue = weight;
                break;
            }
        }
        walletToLpBalance[address] = walletToLpBalance[address]
            ? walletToLpBalance[address].add(bignumber_1.BigNumber.from(tokenIdValue))
            : bignumber_1.BigNumber.from(tokenIdValue);
    }
    return Object.fromEntries(Object.entries(walletToLpBalance).map(([address, balance]) => [
        address,
        balance.toNumber()
    ]));
}
exports.strategy = strategy;
