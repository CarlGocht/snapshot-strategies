"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'samuveth';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const score = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    Object.keys(score).forEach((key) => {
        if (score[key] >= (options.minBalance || 0))
            score[key] = score[key];
        else
            score[key] = 0;
    });
    return score;
}
exports.strategy = strategy;
