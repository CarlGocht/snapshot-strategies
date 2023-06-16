"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'JayWelsh';
exports.version = '0.1.0';
/**
 * xSEEN token ABI
 */
const xseenAbi = [
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
        name: 'totalSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
];
/**
 * SEEN token ABI
 */
const seenAbi = [
    {
        constant: true,
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, params, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const stakingContractSeenBalanceCallParams = [
        '0xCa3FE04C7Ee111F0bbb02C328c699226aCf9Fd33',
        'balanceOf',
        [params.tokenAddress]
    ];
    const seenRes = await (0, utils_1.multicall)(network, provider, seenAbi, [stakingContractSeenBalanceCallParams], { blockTag });
    const seenBalanceInStakingContract = seenRes[0];
    const xseenBalanceCallParams = addresses.map((addr) => [
        params.tokenAddress,
        'balanceOf',
        [addr]
    ]);
    const xseenRes = await (0, utils_1.multicall)(network, provider, xseenAbi, [[params.tokenAddress, 'totalSupply'], ...xseenBalanceCallParams], { blockTag });
    const totalSupply = xseenRes[0];
    const balances = xseenRes.slice(1);
    return Object.fromEntries(balances.map((balance, i) => [
        addresses[i],
        (balance * (seenBalanceInStakingContract / totalSupply)) / 1e18
    ]));
}
exports.strategy = strategy;
