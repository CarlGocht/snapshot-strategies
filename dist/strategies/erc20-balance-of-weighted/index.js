"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'Tanz0rz';
exports.version = '1.0.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const scores = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    return Object.fromEntries(Object.entries(scores).map((score) => [score[0], score[1] * options.weight]));
}
exports.strategy = strategy;
