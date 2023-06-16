"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'bonustrack';
exports.version = '0.1.0';
const abi = [
    {
        constant: true,
        inputs: [],
        name: 'getPricePerFullShare',
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
    }
];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    // eslint-disable-next-line prefer-const
    let [score, [pricePerFullShare]] = await Promise.all([
        (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot),
        (0, utils_1.multicall)(network, provider, abi, [[options.address, 'getPricePerFullShare', []]], { blockTag })
    ]);
    pricePerFullShare = parseFloat((0, units_1.formatUnits)(pricePerFullShare.toString(), 18));
    return Object.fromEntries(Object.entries(score).map((address) => [
        address[0],
        address[1] * pricePerFullShare
    ]));
}
exports.strategy = strategy;
