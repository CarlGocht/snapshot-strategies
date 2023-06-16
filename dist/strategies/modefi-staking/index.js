"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'Modefi';
exports.version = '0.0.1';
const stakingPoolAbi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: '_stakers',
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
            },
            {
                internalType: 'uint256',
                name: 'distributed',
                type: 'uint256'
            }
        ],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'staked',
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
    const stakeResponse = await (0, utils_1.multicall)(network, provider, stakingPoolAbi, addresses.map((address) => [
        options.stakingContract,
        '_stakers',
        [address]
    ]), { blockTag });
    return Object.fromEntries(stakeResponse.map((value, i) => {
        const stakedBalance = stakeResponse[i].amount;
        return [
            addresses[i],
            parseFloat((0, units_1.formatUnits)(stakedBalance.toString(), options.decimals))
        ];
    }));
}
exports.strategy = strategy;
