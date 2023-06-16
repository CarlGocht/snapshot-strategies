"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const erc20_balance_of_1 = require("../erc20-balance-of");
exports.author = 'phoenix-keeper';
exports.version = '1.0.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const multiplier = await (0, utils_1.call)(provider, [options.methodABI], [options.contract_address, options.methodABI.name, options.args], { blockTag });
    const scores = await (0, erc20_balance_of_1.strategy)(space, network, provider, addresses, options, snapshot);
    return Object.fromEntries(Object.entries(scores).map((score) => [score[0], score[1] * multiplier]));
}
exports.strategy = strategy;
