"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'snapshot-labs';
exports.version = '0.1.0';
const abi = ['function delegates(address) view returns (address)'];
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const delegates = await (0, utils_1.multicall)(network, provider, abi, addresses.map((address) => [
        options.address,
        'delegates',
        [address.toLowerCase()]
    ]), { blockTag });
    const score = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    return Object.fromEntries(Object.entries(score).map((address, i) => [
        (0, address_1.getAddress)(address[0]),
        delegates[i].toString().toLowerCase() === options.delegate.toLowerCase()
            ? address[1]
            : 0
    ]));
}
exports.strategy = strategy;
