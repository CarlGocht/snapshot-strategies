"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const delegation_1 = require("../delegation");
exports.author = 'bonustrack';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    return await (0, delegation_1.strategy)(space, network, provider, addresses, {
        strategies: [
            {
                name: 'balancer',
                params: options
            }
        ]
    }, snapshot);
}
exports.strategy = strategy;
