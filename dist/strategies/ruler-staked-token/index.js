"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'drop-out-dev';
exports.version = '0.1.0';
const abi = [
    {
        inputs: [
            { internalType: 'address', name: '_lpToken', type: 'address' },
            { internalType: 'address', name: '_account', type: 'address' }
        ],
        name: 'getUser',
        outputs: [
            {
                components: [
                    { internalType: 'uint256', name: 'amount', type: 'uint256' },
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
            { internalType: 'uint256[]', name: '', type: 'uint256[]' }
        ],
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.stakingAddress,
        'getUser',
        [options.tokenAddress, address]
    ]), { blockTag });
    return Object.fromEntries(response.map(([userInfo], i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(userInfo.amount, options.decimals))
    ]));
}
exports.strategy = strategy;
