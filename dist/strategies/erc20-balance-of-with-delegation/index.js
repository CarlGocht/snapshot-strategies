"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const with_delegation_1 = require("../with-delegation");
exports.author = 'snapshot-labs';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    return await (0, with_delegation_1.strategy)(space, network, provider, addresses, {
        ...options,
        strategies: [
            {
                name: 'erc20-balance-of',
                params: {
                    address: options.address,
                    decimals: options.decimals
                }
            }
        ]
    }, snapshot);
}
exports.strategy = strategy;
