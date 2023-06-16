"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
// Strategies
const erc1155_balance_of_1 = require("../erc1155-balance-of");
const author = 'citydao';
exports.author = author;
const version = '0.0.1';
exports.version = version;
/**
 * CityDAO Square Root Snapshot Strategy
 * @version 0.0.1
 * @summary Holders of an ERC1155 token can cast a number of votes equal to the square root of their net token holdings.
 * @see https://archive.ph/beczV
 * @author Will Holley <https://721.dev>
 */
async function strategy(space, network, provider, addresses, params, snapshot) {
    // Query default scores.
    const scores = await (0, erc1155_balance_of_1.strategy)(space, network, provider, addresses, params, snapshot);
    // Support Plural Voting
    const magnitude = params.voiceCredits || 1;
    // Update in place, rounding down.
    for (const address in scores) {
        scores[address] = Math.floor(Math.sqrt(scores[address] * magnitude));
    }
    return scores;
}
exports.strategy = strategy;
