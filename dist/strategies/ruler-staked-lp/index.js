"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'vfatouros';
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
        inputs: [
            {
                internalType: 'address',
                name: '_lpToken',
                type: 'address'
            },
            {
                internalType: 'address',
                name: '_account',
                type: 'address'
            }
        ],
        name: 'getUser',
        outputs: [
            {
                components: [
                    {
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256[]',
                        name: 'rewardsWriteoffs',
                        type: 'uint256[]'
                    }
                ],
                internalType: 'struct IBonusRewards.User',
                name: '',
                type: 'tuple'
            },
            {
                internalType: 'uint256[]',
                name: '',
                type: 'uint256[]'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const res = await (0, utils_1.multicall)(network, provider, tokenAbi, [
        [options.sushiPoolAddress, 'totalSupply', []],
        [options.tokenAddress, 'balanceOf', [options.sushiPoolAddress]]
    ].concat(addresses.map((address) => [
        options.stakingAddress,
        'getUser',
        [options.sushiPoolAddress, address]
    ])), { blockTag });
    const totalSupply = res[0];
    const tokenBalanceInLP = res[1];
    const tokensPerLP = tokenBalanceInLP / 10 ** options.decimals / (totalSupply / 1e18);
    const response = res.slice(2);
    return Object.fromEntries(response.map(([userInfo], i) => [
        addresses[i],
        (userInfo.amount / 10 ** options.decimals) * tokensPerLP
    ]));
}
exports.strategy = strategy;
