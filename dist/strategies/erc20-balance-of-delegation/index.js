"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.dependOnOtherAddress = exports.version = exports.author = void 0;
const erc20_balance_of_1 = require("../erc20-balance-of");
const delegation_1 = require("../../utils/delegation");
exports.author = 'bonustrack';
exports.version = '0.1.0';
exports.dependOnOtherAddress = true;
async function strategy(space, network, provider, addresses, options, snapshot) {
    const delegationSpace = options.delegationSpace || space;
    const delegations = await (0, delegation_1.getDelegations)(delegationSpace, network, addresses, snapshot);
    if (Object.keys(delegations).length === 0)
        return {};
    const score = await (0, erc20_balance_of_1.strategy)(space, network, provider, Object.values(delegations).reduce((a, b) => a.concat(b)), options, snapshot);
    return Object.fromEntries(addresses.map((address) => {
        const addressScore = delegations[address]
            ? delegations[address].reduce((a, b) => a + score[b], 0)
            : 0;
        return [address, addressScore];
    }));
}
exports.strategy = strategy;
