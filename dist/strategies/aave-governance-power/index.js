"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'kartojal';
exports.version = '0.1.0';
/**
 * Aave Governance strategy to measure voting or
 */
const abi = [
    {
        inputs: [
            { internalType: 'address', name: 'user', type: 'address' },
            { internalType: 'uint256', name: 'blockNumber', type: 'uint256' }
        ],
        name: 'getPropositionPowerAt',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    },
    {
        inputs: [
            { internalType: 'address', name: 'user', type: 'address' },
            { internalType: 'uint256', name: 'blockNumber', type: 'uint256' }
        ],
        name: 'getVotingPowerAt',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
    }
];
const powerTypesToMethod = {
    vote: 'getVotingPowerAt',
    proposition: 'getPropositionPowerAt'
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number'
        ? snapshot
        : await provider.getBlockNumber(snapshot);
    // Early return 0 voting power if governanceStrategy or powerType is not correctly set
    if (!options.governanceStrategy || !powerTypesToMethod[options.powerType]) {
        return Object.fromEntries(addresses.map((address) => [address, '0']));
    }
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.governanceStrategy,
        powerTypesToMethod[options.powerType],
        [address.toLowerCase(), blockTag]
    ]), { blockTag });
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value.toString(), options.decimals))
    ]));
}
exports.strategy = strategy;
