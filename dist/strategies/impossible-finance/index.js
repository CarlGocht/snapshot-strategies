"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const erc20_balance_of_1 = require("../erc20-balance-of");
const utils_1 = require("../../utils");
exports.author = 'impossible-finance';
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
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    const score = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    // Calculates number of LP tokens each guy owns
    addresses.forEach((address) => {
        options.pairs.forEach((pair, idx) => {
            multi.call(`lpBalance.${idx}.${address}`, options.pairs[idx].address, 'balanceOf', [address]);
        });
    });
    // Calculates total IF locked in each pair
    // Also calculates total supply of LP tokens
    options.pairs.forEach((pair, idx) => {
        multi.call(`pairIFBalance.${idx}`, options.address, // IF token address
        'balanceOf', [pair.address]);
        multi.call(`pairTotalSupply.${idx}`, pair.address, 'totalSupply', []);
    });
    const result = await multi.execute();
    return Object.fromEntries(Object.entries(score).map((address) => [
        address[0],
        address[1] +
            options.pairs.reduce((prev, cur, idx) => prev +
                parseFloat((0, units_1.formatUnits)(result.lpBalance[idx][address[0]]
                    .mul(result.pairIFBalance[idx])
                    .mul(options.pairs[idx].weightNumerator)
                    .div(result.pairTotalSupply[idx])
                    .div(options.pairs[idx].weightDenominator), options.pairs[idx].decimals)), 0)
    ]));
}
exports.strategy = strategy;
