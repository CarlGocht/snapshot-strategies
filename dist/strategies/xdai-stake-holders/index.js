"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const xdai_stakers_and_holders_1 = require("../xdai-stakers-and-holders");
exports.author = 'maxaleks';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    return (0, xdai_stakers_and_holders_1.strategy)(space, network, provider, addresses, { ...options, userType: 'holders' }, snapshot);
}
exports.strategy = strategy;
