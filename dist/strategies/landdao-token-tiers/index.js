"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const utils_1 = require("../../utils");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'ethantddavis';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address owner) external view returns (uint256 balance)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // get token balance
    const callWalletToBalanceOf = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const walletAddress of addresses) {
        callWalletToBalanceOf.call(walletAddress, options.address, 'balanceOf', [
            walletAddress
        ]);
    }
    const walletToBalanceOf = await callWalletToBalanceOf.execute();
    // get tokenIds
    const callWalletToAddresses = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletAddress, count] of Object.entries(walletToBalanceOf)) {
        for (let index = 0; index < count.toNumber(); index++) {
            callWalletToAddresses.call(walletAddress.toString() + '-' + index.toString(), options.address, 'tokenOfOwnerByIndex', [walletAddress, index]);
        }
    }
    const walletIDToAddresses = await callWalletToAddresses.execute();
    // fetch ipfs tier weights
    const response = await (0, cross_fetch_1.default)('https://ipfs.io/ipfs/' + options.tokenWeightIPFS, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    });
    const weights = await response.json();
    // sum the weights for each token ID
    const walletToLpBalance = {};
    for (const [walletID, tokenId] of Object.entries(walletIDToAddresses)) {
        const address = walletID.split('-')[0];
        const tokenIdValue = weights[tokenId.toString()];
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
