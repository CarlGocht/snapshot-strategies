"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'crypto_pumpkin';
exports.version = '0.1.0';
/**
 * Any standard xToken with `balanceOf` and `getShareValue` can use this strategy.
 */
const abi = [
    {
        constant: true,
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'getShareValue',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, params, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const balanceCallParams = addresses.map((addr) => [
        params.tokenAddress,
        'balanceOf',
        [addr]
    ]);
    const res = await (0, utils_1.multicall)(network, provider, abi, [[params.tokenAddress, 'getShareValue'], ...balanceCallParams], { blockTag });
    const shareValue = res[0] / 1e18;
    const balances = res.slice(1);
    return Object.fromEntries(balances.map((balance, i) => [addresses[i], (balance * shareValue) / 1e18]));
}
exports.strategy = strategy;
