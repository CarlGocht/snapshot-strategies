"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const baseStrategy_1 = require("../the-graph/baseStrategy");
const delegators_1 = require("./delegators");
exports.author = 'glmaljkovich';
exports.version = '1.0.1';
async function strategy(_space, network, _provider, addresses, _options, snapshot) {
    return await (0, baseStrategy_1.baseStrategy)(_space, network, _provider, addresses, { strategyType: 'delegation', ..._options }, snapshot, delegators_1.delegatorsStrategy);
}
exports.strategy = strategy;
