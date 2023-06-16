"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = '@MushroomsFinan1';
exports.version = '0.1.0';
const erc20Abi = [
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
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
        stateMutability: 'view',
        type: 'function'
    }
];
const masterChefAbi = [
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            },
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'userInfo',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'rewardDebt',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256'
            }
        ],
        name: 'poolInfo',
        outputs: [
            {
                internalType: 'contract IERC20',
                name: 'lpToken',
                type: 'address'
            },
            {
                internalType: 'uint256',
                name: 'allocPoint',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'lastRewardBlock',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'accMMPerShare',
                type: 'uint256'
            },
            {
                internalType: 'uint256',
                name: 'amount',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const masterChefMulti = new utils_1.Multicaller(network, provider, masterChefAbi, {
        blockTag
    });
    addresses.forEach((address) => {
        masterChefMulti.call(`${address}.userInfo.amount`, options.masterchef, 'userInfo', [options.pool, address]);
    });
    if (options.type === 'lp') {
        masterChefMulti.call('poolInfo.lpToken', options.masterchef, 'poolInfo', [
            options.pool
        ]);
        const masterChefResult = await masterChefMulti.execute();
        const erc20Multi = new utils_1.Multicaller(network, provider, erc20Abi, {
            blockTag
        });
        erc20Multi.call('lpTotalSupply', masterChefResult.poolInfo.lpToken[0], 'totalSupply');
        erc20Multi.call('poolMMBalance', options.govtoken, 'balanceOf', [
            masterChefResult.poolInfo.lpToken[0]
        ]);
        const erc20Result = await erc20Multi.execute();
        return Object.fromEntries(addresses.map((address) => {
            return [
                address,
                parseFloat((0, units_1.formatUnits)(masterChefResult[address].userInfo.amount[0]
                    .mul(erc20Result.poolMMBalance)
                    .div(erc20Result.lpTotalSupply)
                    .toString(), 18))
            ];
        }));
    }
    else {
        const masterChefResult = await masterChefMulti.execute();
        return Object.fromEntries(addresses.map((address) => {
            return [
                address,
                parseFloat((0, units_1.formatUnits)(masterChefResult[address].userInfo.amount.toString(), 18))
            ];
        }));
    }
}
exports.strategy = strategy;
