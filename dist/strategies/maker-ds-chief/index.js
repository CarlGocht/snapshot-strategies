"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'bonustrack';
exports.version = '0.1.0';
const MAKER_DS_CHIEF_ADDRESS = {
    '1': '0x9ef05f7f6deb616fd37ac3c959a2ddd25a54e4f5'
};
const abi = [
    {
        constant: true,
        inputs: [
            {
                name: '',
                type: 'address'
            }
        ],
        name: 'deposits',
        outputs: [
            {
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
    const response = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        MAKER_DS_CHIEF_ADDRESS[network],
        'deposits',
        [address]
    ]), { blockTag });
    return Object.fromEntries(response.map((value, i) => [
        addresses[i],
        parseFloat((0, units_1.formatUnits)(value.toString(), options.decimals))
    ]));
}
exports.strategy = strategy;
