"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const bignumber_1 = require("@ethersproject/bignumber");
exports.author = 'theothercrypto';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    'function tokenTier(uint256 index) external view returns (uint256)',
    'function tokenUsed(uint256 _id) public view virtual returns (bool)'
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
    // Third, given the tokenIds for each token
    const callWalletToTiers = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletAddress, tokenId] of Object.entries(walletIDToAddresses)) {
        callWalletToTiers.call(walletAddress.toString() + '-' + tokenId.toString(), options.address, 'tokenTier', [tokenId]);
    }
    const walletIDToTiers = await callWalletToTiers.execute();
    // Third, given the tokenIds for each token get if the token is used
    const callWalletToUsed = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletAddress, tokenId] of Object.entries(walletIDToAddresses)) {
        callWalletToUsed.call(walletAddress.toString() + '-' + tokenId.toString(), options.address, 'tokenUsed', [tokenId]);
    }
    const walletIDToUsed = await callWalletToUsed.execute();
    // Ultimately, sum the weights for each tokenId and assign votes based on the
    // strategy parameters
    const walletToLpBalance = {};
    for (const [walletID, tokenTier] of Object.entries(walletIDToTiers)) {
        const address = walletID.split('-')[0];
        const used = walletIDToUsed[walletID];
        if (!options.countUsed && used) {
            // Its used and
            continue;
        }
        // Voting power given by the tier of NFTs owned
        const tokenIdValue = options.tierToWeight[tokenTier - 1];
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
