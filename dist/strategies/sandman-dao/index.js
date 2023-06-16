"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'sandmanfinance';
exports.version = '0.0.1';
const factoryNftABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    'function getCharacterOverView(uint256 tokenId) external view returns (string memory, uint256, uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // First, get the balance of nft
    const callWalletToBalanceOf = new utils_1.Multicaller(network, provider, factoryNftABI, {
        blockTag
    });
    for (const walletAddress of addresses) {
        callWalletToBalanceOf.call(walletAddress, options.address, 'balanceOf', [
            walletAddress
        ]);
    }
    const walletToBalanceOf = await callWalletToBalanceOf.execute();
    // Second, get the tokenId's for each nft
    const callWalletToAddresses = new utils_1.Multicaller(network, provider, factoryNftABI, {
        blockTag
    });
    for (const [walletAddress, count] of Object.entries(walletToBalanceOf)) {
        for (let index = 0; index < count.toNumber(); index++) {
            callWalletToAddresses.call(walletAddress.toString() + '-' + index.toString(), options.address, 'tokenOfOwnerByIndex', [walletAddress, index]);
        }
    }
    const walletIDToAddresses = await callWalletToAddresses.execute();
    // Third, get skil's for each tokenId
    const callTokenToSkill = new utils_1.Multicaller(network, provider, factoryNftABI, {
        blockTag
    });
    for (const [walletID, tokenId] of Object.entries(walletIDToAddresses)) {
        callTokenToSkill.call(walletID, options.address, 'getCharacterOverView', [
            tokenId
        ]);
    }
    const walletIDToSkills = await callTokenToSkill.execute();
    const results = {};
    for (const [walletID, values] of Object.entries(walletIDToSkills)) {
        const address = walletID.split('-')[0];
        const currentExperience = values[1] / 1e18;
        let extraBoosted = 1;
        if (currentExperience > 0) {
            extraBoosted = currentExperience / 100;
        }
        results[address] = (results[address] || 0) + extraBoosted;
    }
    return Object.fromEntries(Object.entries(results).map(([address, weight]) => [address, weight]));
}
exports.strategy = strategy;
