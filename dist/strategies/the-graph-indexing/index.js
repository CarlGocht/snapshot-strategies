"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const baseStrategy_1 = require("../the-graph/baseStrategy");
const indexers_1 = require("./indexers");
exports.author = 'glmaljkovich';
exports.version = '1.0.1';
async function strategy(_space, network, _provider, addresses, _options, snapshot) {
    return await (0, baseStrategy_1.baseStrategy)(_space, network, _provider, addresses, { strategyType: 'indexing', ..._options }, snapshot, indexers_1.indexersStrategy);
}
exports.strategy = strategy;
