"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'OxAL7';
exports.version = '0.0.1';
const MOD_POOL_ADDRESS = '0x3093896c81c8d8b9bf658fbf1aede09207850ca2';
const abi = [
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
const stakingPoolAbi = [
    {
        inputs: [
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
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const balanceResponse = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [options.address, 'balanceOf', [address]]), { blockTag });
    const stakeResponse = await (0, utils_1.multicall)(network, provider, stakingPoolAbi, addresses.map((address) => [MOD_POOL_ADDRESS, 'userInfo', [address]]), { blockTag });
    return Object.fromEntries(balanceResponse.map((value, i) => {
        const balance1 = value[0];
        const balance2 = stakeResponse[i].amount;
        const sum = balance1.add(balance2);
        return [
            addresses[i],
            parseFloat((0, units_1.formatUnits)(sum.toString(), options.decimals))
        ];
    }));
}
exports.strategy = strategy;
