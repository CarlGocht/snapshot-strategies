"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.dependOnOtherAddress = exports.version = exports.author = void 0;
const delegation_1 = require("../../utils/delegation");
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
exports.author = '0xbutterfield';
exports.version = '0.1.0';
exports.dependOnOtherAddress = true;
async function strategy(space, network, provider, addresses, options, snapshot) {
    const delegationSpace = options.delegationSpace || space;
    const overrides = Object.fromEntries(Object.entries(options.overrides ?? {}).map(([key, value]) => [
        (0, address_1.getAddress)(key),
        (0, address_1.getAddress)(value)
    ]));
    // Remove duplicates
    const allAddresses = addresses
        .concat(Object.keys(overrides))
        .filter((v, i, a) => a.indexOf(v) === i);
    const delegations = await (0, delegation_1.getDelegations)(delegationSpace, network, allAddresses, snapshot);
    if (Object.keys(delegations).length === 0)
        return {};
    const scores = (await (0, utils_1.getScoresDirect)(space, options.strategies, network, provider, Object.values(delegations).reduce((a, b) => a.concat(b)), snapshot)).filter((score) => Object.keys(score).length !== 0);
    return allAddresses
        .map((address) => {
        const addressScore = delegations[address]
            ? delegations[address].reduce((a, b) => a + scores.reduce((x, y) => (y[b] ? x + y[b] : x), 0), 0)
            : 0;
        return [address, addressScore];
    })
        .reduce((acc, [address, addressScore]) => {
        const delegatee = overrides[address];
        if (delegatee) {
            return {
                ...acc,
                // Redirect the votes for address to delegatee
                [address]: 0,
                [delegatee]: (acc[delegatee] ?? 0) + addressScore
            };
        }
        // It is possible that address has already been set with an override,
        // so add the score to that value (or zero)
        return { ...acc, [address]: (acc[address] ?? 0) + addressScore };
    }, {});
}
exports.strategy = strategy;
