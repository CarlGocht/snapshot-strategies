"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const baseStrategy_1 = require("../the-graph/baseStrategy");
const balances_1 = require("./balances");
exports.author = 'glmaljkovich';
exports.version = '1.0.1';
async function strategy(_space, network, _provider, addresses, _options, snapshot) {
    return await (0, baseStrategy_1.baseStrategy)(_space, network, _provider, addresses, { strategyType: 'balance', ..._options }, snapshot, balances_1.balanceStrategy);
}
exports.strategy = strategy;
