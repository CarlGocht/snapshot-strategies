"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const utils_1 = require("../../utils");
exports.author = 'tomyumswap';
exports.version = '0.0.1';
const MINIMUM_VOTING_POWER = 0.01;
const SMART_CHEF_URL = 'https://api.thegraph.com/subgraphs/name/tomyumswap/smartchef';
const VOTING_API_URL = 'http://voting-api.tomyumswap.com/api/';
/**
 * Fetches voting power of one address
 */
// const fetchVotingPower = async (
//   address: string,
//   block: number,
//   poolAddresses: string[]
// ): Promise<VotingResponse> => {
//   const response = await fetch(`${VOTING_API_URL}power`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       block,
//       address,
//       poolAddresses
//     })
//   });
//   const payload = await response.json();
//   return payload.data;
// };
/**
 * Fetches voting power of multiple addresses
 */
const fetchVotingPowerMultiple = async (addresses, block, poolAddresses) => {
    const response = await (0, cross_fetch_1.default)(`${VOTING_API_URL}powerV2`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            block,
            addresses,
            poolAddresses
        })
    });
    const payload = await response.json();
    return payload.data;
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : await provider.getBlockNumber();
    const params = {
        smartChefs: {
            __args: {
                where: {
                    startBlock_lte: blockTag,
                    endBlock_gte: blockTag
                },
                first: 1000,
                orderBy: 'block',
                orderDirection: 'desc'
            },
            id: true,
            startBlock: true,
            endBlock: true
        }
    };
    const results = await (0, utils_1.subgraphRequest)(SMART_CHEF_URL, params);
    if (!results) {
        return;
    }
    try {
        const poolAddresses = results.smartChefs.map((pool) => pool.id);
        const votingPowerResult = await fetchVotingPowerMultiple(addresses, blockTag, poolAddresses);
        const calculatedPower = votingPowerResult.reduce((accum, response, index) => {
            const address = addresses[index];
            const total = parseFloat(response.total);
            return {
                ...accum[index],
                [address]: total <= MINIMUM_VOTING_POWER ? MINIMUM_VOTING_POWER : total
            };
        }, {});
        return calculatedPower;
    }
    catch {
        return [];
    }
}
exports.strategy = strategy;
