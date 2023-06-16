"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'stablexswap';
exports.version = '0.0.1';
const abi = [
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [
            {
                internalType: 'uint256',
                name: 'amount',
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
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'poolsInfo',
        outputs: [
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
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => {
        multi.call(`stax.${address}`, options.stax.address, 'balanceOf', [address]);
        multi.call(`stakingChef.${address}`, options.stakingchef.address, 'poolsInfo', [address]);
        options.pools.forEach((pool) => {
            multi.call(`masterChef.${address}.pool_${pool.poolId}`, options.masterchef.address, 'userInfo', [pool.poolId, address]);
        });
    });
    const result = await multi.execute();
    const parseRes = (elem, decimals) => {
        return parseFloat((0, units_1.formatUnits)(elem, decimals));
    };
    return Object.fromEntries(addresses.map((address) => [
        address,
        parseRes(result.stax[address], options.stax.decimals) +
            parseRes(result.stakingChef[address], options.stakingchef.decimals) *
                options.stakingchef.weightage +
            +options.pools.reduce((prev, pool) => prev +
                parseRes(result.masterChef[address][`pool_${pool.poolId}`][0], options.masterchef.decimals) *
                    pool.weightage, 0)
    ]));
}
exports.strategy = strategy;
