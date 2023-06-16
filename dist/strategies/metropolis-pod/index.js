"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const erc1155_balance_of_ids_weighted_1 = require("../erc1155-balance-of-ids-weighted");
exports.author = 'itsdanwu';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const score = await (0, erc1155_balance_of_ids_weighted_1.strategy)(space, network, provider, addresses, {
        address: '0x0762aa185b6ed2dca77945ebe92de705e0c37ae3',
        ids: [options.id],
        weight: parseFloat(options.weight || 1)
    }, snapshot);
    return Object.fromEntries(Object.entries(score).map((a) => [a[0], a[1]]));
}
exports.strategy = strategy;
