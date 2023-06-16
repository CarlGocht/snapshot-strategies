"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'thlynn';
exports.version = '0.1.0';
const abi = [
    'function balanceOf(address account) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
    'function balanceOfNFT(uint256 _tokenId) external view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multiCallBalanceOf = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    addresses.forEach((address) => multiCallBalanceOf.call(address, options.address, 'balanceOf', [address]));
    const walletBalanceOf = await multiCallBalanceOf.execute();
    const multiCallTokenOfOwner = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletAddress, count] of Object.entries(walletBalanceOf)) {
        for (let index = 0; index < count.toNumber(); index++) {
            multiCallTokenOfOwner.call(walletAddress.toString() + '-' + index.toString(), options.address, 'tokenOfOwnerByIndex', [walletAddress, index]);
        }
    }
    const walletIDToAddresses = await multiCallTokenOfOwner.execute();
    // Third, get voting power for each tokenId
    const multiCallBalanceOfNFT = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletID, tokenId] of Object.entries(walletIDToAddresses)) {
        multiCallBalanceOfNFT.call(walletID, options.address, 'balanceOfNFT', [
            tokenId
        ]);
    }
    const walletVotingPower = await multiCallBalanceOfNFT.execute();
    const result = {};
    for (const [walletID, value] of Object.entries(walletVotingPower)) {
        const address = walletID.split('-')[0];
        result[address] =
            (result[address] || 0) + parseFloat((0, units_1.formatUnits)(value, options.decimals));
    }
    return Object.fromEntries(Object.entries(result).map(([address, balance]) => [address, balance]));
}
exports.strategy = strategy;
