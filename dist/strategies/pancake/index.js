"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'pancake-swap';
exports.version = '0.0.1';
const sousChefabi = [
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
    }
];
const masterChefContractAddress = '0x73feaa1eE314F8c655E354234017bE2193C9E24E';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const score = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    const masterBalances = await (0, utils_1.multicall)(network, provider, masterChefAbi, addresses.map((address) => [
        masterChefContractAddress,
        'userInfo',
        ['0', address]
    ]), { blockTag });
    const sousBalances = await Promise.all(options.chefAddresses.map((item) => (0, utils_1.multicall)(network, provider, sousChefabi, addresses.map((address) => [
        item.address,
        'userInfo',
        [address],
        { blockTag }
    ]), { blockTag })));
    return Object.fromEntries(Object.entries(score).map((address, index) => [
        address[0],
        address[1] +
            parseFloat((0, units_1.formatUnits)(masterBalances[index].amount.toString(), 18)) +
            sousBalances.reduce((prev, cur, idx) => prev +
                parseFloat((0, units_1.formatUnits)(cur[index].amount.toString(), options.chefAddresses[idx].decimals)), 0)
    ]));
}
exports.strategy = strategy;
