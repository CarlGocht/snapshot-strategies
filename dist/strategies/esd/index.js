"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'l3wi';
exports.version = '0.1.0';
const abi = [
    {
        constant: true,
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOfBonded',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
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
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const daoQuery = addresses.map((address) => [
        options.dao,
        'balanceOfBonded',
        [address]
    ]);
    const lpQuery = addresses.map((address) => [
        options.rewards,
        'balanceOfBonded',
        [address]
    ]);
    const response = await (0, utils_1.multicall)(network, provider, abi, [
        [options.token, 'balanceOf', [options.uniswap]],
        [options.uniswap, 'totalSupply'],
        ...daoQuery,
        ...lpQuery
    ], { blockTag });
    const uniswapESD = response[0];
    const uniswapTotalSupply = response[1];
    const daoBalances = response.slice(2, addresses.length + 2);
    const lpBalances = response.slice(addresses.length + 2, addresses.length * 2 + 2);
    return Object.fromEntries(Array(addresses.length)
        .fill('x')
        .map((_, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(uniswapESD[0]
            .div(uniswapTotalSupply[0])
            .mul(lpBalances[i][0])
            .add(daoBalances[i][0])
            .toString(), options.decimals))
    ]));
}
exports.strategy = strategy;
