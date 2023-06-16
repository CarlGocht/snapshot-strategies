"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const units_1 = require("@ethersproject/units");
exports.author = 'pepemon';
exports.version = '0.1.0';
const tokenAbi = [
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
        inputs: [],
        name: 'totalSupply',
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
                name: '_account',
                type: 'address'
            }
        ],
        name: 'getAddressPpblzStakeAmount',
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
                name: '_account',
                type: 'address'
            }
        ],
        name: 'getAddressUniV2StakeAmount',
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
    }
];
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const res = await (0, utils_1.multicall)(network, provider, tokenAbi, [
        [options.uniswapAddress, 'totalSupply', []],
        [options.tokenAddress, 'balanceOf', [options.uniswapAddress]]
    ]
        .concat(addresses.map((address) => [
        options.tokenAddress,
        'balanceOf',
        [address]
    ]))
        .concat(addresses.map((address) => [
        options.stakingAddress,
        'getAddressPpblzStakeAmount',
        [address]
    ]))
        .concat(addresses.map((address) => [
        options.uniswapAddress,
        'balanceOf',
        [address]
    ]))
        .concat(addresses.map((address) => [
        options.stakingAddress,
        'getAddressUniV2StakeAmount',
        [address]
    ])), { blockTag });
    const totalSupply = res[0][0];
    const tokenBalanceInUni = res[1][0];
    const p1 = res.slice(2, 2 + addresses.length);
    const p2 = res.slice(2 + addresses.length, 2 + addresses.length * 2);
    const p3 = res.slice(2 + addresses.length * 2, 2 + addresses.length * 3);
    const p4 = res.slice(2 + addresses.length * 3, 2 + addresses.length * 4);
    return Object.fromEntries(p1.map((values, i) => [
        addresses[i],
        //ppblz_, uniV2PoolTokens
        parseFloat((0, units_1.formatUnits)(p1[i][0].toString(), 18)) +
            parseFloat((0, units_1.formatUnits)(p2[i][0].toString(), 18)) +
            parseFloat((0, units_1.formatUnits)(p3[i][0].mul(tokenBalanceInUni).div(totalSupply).toString(), 18)) +
            parseFloat((0, units_1.formatUnits)(p4[i][0].mul(tokenBalanceInUni).div(totalSupply).toString(), 18))
    ]));
}
exports.strategy = strategy;
