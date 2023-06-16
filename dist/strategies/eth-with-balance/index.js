"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const eth_balance_1 = require("../eth-balance");
exports.author = 'AronVanAmmers';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const score = await (0, eth_balance_1.strategy)(space, network, provider, addresses, options, snapshot);
    return Object.fromEntries(Object.entries(score).map((address) => [
        address[0],
        address[1] > (options.minBalance || 0) ? 1 : 0
    ]));
}
exports.strategy = strategy;
