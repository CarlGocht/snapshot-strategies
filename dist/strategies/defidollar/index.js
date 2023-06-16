"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'atvanguard';
exports.version = '1.0.0';
const abi = [
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
        name: 'getPricePerFullShare',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const queries = [];
    addresses.forEach((voter) => {
        queries.push([options.address, 'balanceOf', [voter]]);
    });
    queries.push([options.address, 'getPricePerFullShare']);
    const response = (await (0, utils_1.multicall)(network, provider, abi, queries, { blockTag })).map((r) => r[0]);
    const pps = response[response.length - 1];
    return Object.fromEntries(Array(addresses.length)
        .fill('x')
        .map((_, i) => {
        return [
            addresses[i],
            parseFloat((0, units_1.formatUnits)(response[i].mul(pps), 36 /* decimals */))
        ];
    }));
}
exports.strategy = strategy;
