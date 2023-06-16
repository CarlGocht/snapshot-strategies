"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'bonustrack';
exports.version = '0.1.0';
const abi = [
    {
        inputs: [{ internalType: 'address', name: '_address', type: 'address' }],
        name: 'isWhitelisted',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [{ internalType: 'address', name: '', type: 'address' }],
        name: 'stakes',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multi = new utils_1.Multicaller(network, provider, abi, { blockTag });
    addresses.forEach((address) => {
        multi.call(`${address}.isWhitelisted`, options.whitelist, 'isWhitelisted', [
            address
        ]);
        multi.call(`${address}.stake`, options.stake, 'stakes', [address]);
    });
    const result = await multi.execute();
    return Object.fromEntries(addresses.map((address) => {
        const stake = parseFloat((0, units_1.formatUnits)(result[address].stake.toString(), options.decimals));
        return [
            address,
            result[address].isWhitelisted ? Math.sqrt(stake) + 1 : 0
        ];
    }));
}
exports.strategy = strategy;
