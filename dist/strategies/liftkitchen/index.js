"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'Gruffin';
exports.version = '0.1.1';
const abi = [
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            }
        ],
        name: 'getbalanceOfControl',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address'
            }
        ],
        name: 'earned',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
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
    const queries = [];
    const addressCount = addresses.length;
    addresses.forEach((address) => {
        queries.push([options.ctrl, 'balanceOf', [address]]);
    });
    addresses.forEach((address) => {
        queries.push([options.boardroom, 'getbalanceOfControl', [address]]);
    });
    addresses.forEach((address) => {
        queries.push([options.boardroom, 'earned', [address]]);
    });
    const response = await (0, utils_1.multicall)(network, provider, abi, queries, {
        blockTag
    });
    const ctrlOwned = response.slice(0, addressCount);
    const ctrlStaked = response.slice(addressCount, addressCount * 2);
    const ctrlEarned = response.slice(addressCount * 2, addressCount * 3);
    return Object.fromEntries(Array(addresses.length)
        .fill('x')
        .map((_, i) => {
        const score = ctrlOwned[i][0]
            .add(ctrlStaked[i][0])
            .add(ctrlEarned[i][0])
            .add(ctrlEarned[i][1]);
        return [
            addresses[i],
            parseFloat((0, units_1.formatUnits)(score.toString(), options.decimals))
        ];
    }));
}
exports.strategy = strategy;
