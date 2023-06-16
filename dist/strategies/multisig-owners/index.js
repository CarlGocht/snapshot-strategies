"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'davekaj';
exports.version = '0.1.0';
const abi = [
    {
        constant: true,
        inputs: [
            {
                internalType: 'address',
                name: 'owner',
                type: 'address'
            }
        ],
        name: 'isOwner',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool'
            }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [options.address, 'isOwner', [address]]), { blockTag });
    return Object.fromEntries(response.map((value, i) => [addresses[i], value[0] ? 1 : 0]));
}
exports.strategy = strategy;
