"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const erc20_balance_of_1 = require("../erc20-balance-of");
const delegation_1 = require("../../utils/delegation");
exports.author = 'ferittuncer';
exports.version = '1.0.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const delegations = await (0, delegation_1.getDelegations)(space, network, addresses, snapshot);
    if (Object.keys(delegations).length === 0)
        return {};
    const score = await (0, erc20_balance_of_1.strategy)(space, network, provider, Object.values(delegations).reduce((a, b) => a.concat(b)), options, snapshot);
    return Object.fromEntries(addresses.map((address) => {
        const addressScore = delegations[address]
            ? delegations[address].reduce((a, b) => (Math.sqrt(a) + Math.sqrt(score[b])) ^ 2, 0)
            : 0;
        return [address, addressScore];
    }));
}
exports.strategy = strategy;
