"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const delegation_1 = require("../../utils/delegation");
const utils_1 = require("../../utils");
exports.author = 'snapshot-labs';
exports.version = '0.1.0';
async function strategy(space, network, provider, addresses, options, snapshot) {
    addresses = addresses.map(address_1.getAddress);
    const delegationSpace = options.delegationSpace || space;
    const delegationNetwork = options.delegationNetwork || network;
    let delegationSnapshot = snapshot;
    if (delegationNetwork !== network) {
        const snapshots = await (0, utils_1.getSnapshots)(network, snapshot, provider, [
            delegationNetwork
        ]);
        delegationSnapshot = snapshots[delegationNetwork];
    }
    const delegationsData = await (0, delegation_1.getDelegationsData)(delegationSpace, delegationNetwork, addresses, delegationSnapshot);
    const delegations = delegationsData.delegations;
    // Get scores for all addresses and delegators
    if (Object.keys(delegations).length === 0)
        return {};
    const allAddresses = Object.values(delegations).reduce((a, b) => a.concat(b), []);
    allAddresses.push(...addresses);
    const scores = (await (0, utils_1.getScoresDirect)(space, options.strategies, network, provider, allAddresses, snapshot)).filter((score) => Object.keys(score).length !== 0);
    const finalScore = Object.fromEntries(addresses.map((address) => {
        const addressScore = delegations[address]
            ? delegations[address].reduce((a, b) => a + scores.reduce((x, y) => (y[b] ? x + y[b] : x), 0), 0)
            : 0;
        return [address, addressScore];
    }));
    // Add own scores if not delegated to anyone
    addresses.forEach((address) => {
        if (!delegationsData.allDelegators.includes(address)) {
            finalScore[address] += scores.reduce((a, b) => a + (b[address] ? b[address] : 0), 0);
        }
    });
    return finalScore;
}
exports.strategy = strategy;
