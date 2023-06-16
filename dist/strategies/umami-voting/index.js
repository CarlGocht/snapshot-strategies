"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'EncryptedBunny';
exports.version = '0.1.0';
/// Voting power For mUMAMI holders
/// Includes mUMAMI in autocompounder and stake farm (cmUMAMI, staked cmUMAMI)
const abi = [
    'function balanceOf(address account) view returns (uint256)',
    'function stakedBalance(address account) view returns (uint256)',
    'function getDepositTokensForShares(uint256 amount) view returns (uint256)'
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // Balance of mUMAMI in wallets
    const mUmamiBalance = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    // Balance of cmUMAMI in wallets -> mUMAMI in compounder
    const cmUmamiBalance = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.cmUMAMIAddress,
        'balanceOf',
        [address]
    ]), { blockTag });
    // Balance Staked cmUMAMI -> cmUMAMI in farm
    const stakedcmUmamiBalance = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.stakedcmUMAMIAddress,
        'stakedBalance',
        [address]
    ]), { blockTag });
    // Ratio of mUMAMI per cmUMAMI
    const ratio = await (0, utils_1.call)(provider, abi, [
        options.cmUMAMIAddress,
        'getDepositTokensForShares',
        ['1000000000000000000']
    ]);
    return Object.fromEntries(Object.entries(mUmamiBalance).map(([address, balance], index) => [
        address,
        balance +
            (parseFloat((0, units_1.formatUnits)(cmUmamiBalance[index][0], options.decimals)) *
                ratio) /
                1000000000000000000 +
            (parseFloat((0, units_1.formatUnits)(stakedcmUmamiBalance[index][0], options.decimals)) *
                ratio) /
                1000000000000000000
    ]));
}
exports.strategy = strategy;
