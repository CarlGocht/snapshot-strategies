"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const multichain_1 = require("../multichain");
exports.author = 'lightninglu10';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const tokens = options.tokenAddresses || [];
    options.strategies = tokens.map((token) => ({
        name: 'erc20-with-balance',
        network: token.network,
        params: {
            address: token.address,
            decimals: token.decimals,
            minBalance: token.minBalance
        }
    }));
    const scores = await (0, multichain_1.strategy)(space, network, provider, addresses, options, snapshot);
    return Object.fromEntries(Object.entries(scores).map((address) => [
        address[0],
        address[1] === tokens.length ? 1 : 0
    ]));
}
exports.strategy = strategy;
