"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'mystbrent';
exports.version = '0.1.0';
const abi = [
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [],
        name: 'getCurrentHaloHaloPrice',
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
    addresses.forEach((address) => {
        multi.call(`scores.${address}.dsrtBalance`, options.token, 'balanceOf', [
            address
        ]);
    });
    multi.call('dsrtPrice', options.token, 'getCurrentHaloHaloPrice');
    const result = await multi.execute();
    const dsrtPrice = result.dsrtPrice;
    return Object.fromEntries(Array(addresses.length)
        .fill('')
        .map((_, i) => {
        const dsrtBalances = result.scores[addresses[i]].dsrtBalance;
        return [
            addresses[i],
            parseFloat((0, units_1.formatUnits)(dsrtBalances.mul(dsrtPrice), 36))
        ];
    }));
}
exports.strategy = strategy;
