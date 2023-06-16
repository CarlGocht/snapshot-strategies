"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const bytes_1 = require("@ethersproject/bytes");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'thegostep';
exports.version = '0.1.1';
const abi = [
    'function balanceOf(address owner) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)'
];
// options
// {
//   "crucible_factory": "0x54e0395CFB4f39beF66DBCd5bD93Cca4E9273D56",
//   "erc20_address": "0xCD6bcca48069f8588780dFA274960F15685aEe0e",
//   "erc20_decimals": 18
// }
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // get the number of crucibles owned by the wallet
    // wallet_address => crucible_count
    const callWalletToCrucibleCount = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const walletAddress of addresses) {
        callWalletToCrucibleCount.call(walletAddress, options.crucible_factory, 'balanceOf', [walletAddress]);
    }
    const walletToCrucibleCount = await callWalletToCrucibleCount.execute();
    // get the address of each crucible
    // wallet_address : crucible_index => crucible_address
    const callWalletToCrucibleAddresses = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletAddress, crucibleCount] of Object.entries(walletToCrucibleCount)) {
        for (let index = 0; index < crucibleCount.toNumber(); index++) {
            callWalletToCrucibleAddresses.call(walletAddress.toString() + '-' + index.toString(), options.crucible_factory, 'tokenOfOwnerByIndex', [walletAddress, index]);
        }
    }
    const walletIDToCrucibleAddresses = await callWalletToCrucibleAddresses.execute();
    // get the balance of each crucible
    // crucible_address => lp_balance
    const callCrucibleToLpBalance = new utils_1.Multicaller(network, provider, abi, {
        blockTag
    });
    for (const [walletID, crucibleAddress] of Object.entries(walletIDToCrucibleAddresses)) {
        callCrucibleToLpBalance.call(walletID, options.erc20_address, 'balanceOf', [
            (0, bytes_1.hexZeroPad)(crucibleAddress.toHexString(), 20)
        ]);
    }
    const walletIDToLpBalance = await callCrucibleToLpBalance.execute();
    // sum the amount of LP tokens held across all crucibles
    // wallet_address => lp_balance
    const walletToLpBalance = {};
    for (const [walletID, lpBalance] of Object.entries(walletIDToLpBalance)) {
        const address = walletID.split('-')[0];
        walletToLpBalance[address] = walletToLpBalance[address]
            ? walletToLpBalance[address].add(lpBalance)
            : lpBalance;
    }
    return Object.fromEntries(Object.entries(walletToLpBalance).map(([address, balance]) => [
        address,
        parseFloat((0, units_1.formatUnits)(balance, options.erc20_decimals))
    ]));
}
exports.strategy = strategy;
