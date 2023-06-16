"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const esd_1 = require("../esd");
const delegation_1 = require("../../utils/delegation");
exports.author = 'l3wi';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const delegations = await (0, delegation_1.getDelegations)(space, network, addresses, snapshot);
    if (Object.keys(delegations).length === 0)
        return {};
    const score = await (0, esd_1.strategy)(space, network, provider, Object.values(delegations).reduce((a, b) => a.concat(b)), options, snapshot);
    return Object.fromEntries(addresses.map((address) => {
        const addressScore = delegations[address]
            ? delegations[address].reduce((a, b) => a + score[b], 0)
            : 0;
        return [address, addressScore];
    }));
}
exports.strategy = strategy;
