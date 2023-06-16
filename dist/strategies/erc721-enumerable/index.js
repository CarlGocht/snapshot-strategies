"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'bonustrack';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    options.decimals = 0;
    return await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
}
exports.strategy = strategy;
