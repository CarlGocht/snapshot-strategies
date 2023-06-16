"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const erc1155_balance_of_ids_1 = require("../erc1155-balance-of-ids");
exports.author = 'naomsa';
exports.version = '1.0.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const score = await (0, erc1155_balance_of_ids_1.strategy)(space, network, provider, addresses, options, snapshot);
    return Object.fromEntries(Object.entries(score).map((address) => [
        address[0],
        address[1] * options.weight
    ]));
}
exports.strategy = strategy;
