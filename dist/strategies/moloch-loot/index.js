"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'scottrepreneur';
exports.version = '0.1.0';
const abi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'memberAddressByDelegateKey',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'members',
        outputs: [
            {
                internalType: 'address',
                name: 'delegateKey',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'shares',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'loot',
                type: 'uint256'
            },
            {
                internalType: 'bool',
                name: 'exists',
                type: 'bool'
            },
            {
                internalType: 'uint256',
                name: 'highestIndexYesVote',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'jailed',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'totalShares',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const memberAddresses = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.address,
        'memberAddressByDelegateKey',
        [address]
    ]), { blockTag });
    const response = await (0, utils_1.multicall)(network, provider, abi, memberAddresses
        .filter((addr) => addr.toString() !== '0x0000000000000000000000000000000000000000')
        .map((addr) => [options.address, 'members', [addr.toString()]]), { blockTag });
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value.loot.toString(), options.decimals))
    ]));
}
exports.strategy = strategy;
