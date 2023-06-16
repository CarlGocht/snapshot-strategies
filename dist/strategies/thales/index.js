"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'vpoklopic';
exports.version = '1.0.3';
const THALES_SUBGRAPH_URL = {
    optimism: 'https://api.thegraph.com/subgraphs/name/thales-markets/thales-token',
    arbitrum: 'https://api.thegraph.com/subgraphs/name/thales-markets/thales-token-arbitrum'
};
function returnGraphParams(addresses) {
    return {
        stakers: {
            __args: {
                first: 1000,
                orderBy: 'totalStakedAmount',
                orderDirection: 'desc',
                where: {
                    totalStakedAmount_gt: 0,
                    id_in: addresses.map((addr) => addr.toLowerCase())
                }
            },
            id: true,
            timestamp: true,
            totalStakedAmount: true
        }
    };
}
async function strategy(_space, _network, _provider, addresses, options) {
    const optimismGraphParams = returnGraphParams(addresses);
    if (options.blockOptimism !== undefined) {
        // @ts-ignore
        optimismGraphParams.stakers.__args.block = {
            number: options.blockOptimism
        };
    }
    const arbitrumGraphParams = returnGraphParams(addresses);
    if (options.blockArbitrum !== undefined) {
        // @ts-ignore
        arbitrumGraphParams.stakers.__args.block = {
            number: options.blockArbitrum
        };
    }
    const score = {};
    const [optimismStakers, arbitrumStakers] = await Promise.all([
        (0, utils_1.subgraphRequest)(THALES_SUBGRAPH_URL.optimism, optimismGraphParams),
        (0, utils_1.subgraphRequest)(THALES_SUBGRAPH_URL.arbitrum, arbitrumGraphParams)
    ]);
    // We are starting by mapping all Optimism stakers
    if (optimismStakers && optimismStakers.stakers) {
        optimismStakers.stakers.forEach((staker) => {
            score[(0, address_1.getAddress)(staker.id)] = parseFloat((0, units_1.formatUnits)(staker.totalStakedAmount, options.decimals));
        });
    }
    // If the Optimism staker is also staker on Arbitrum, add an amount
    // Otherwise, just set Arbitrum staked amount as a score
    if (arbitrumStakers && arbitrumStakers.stakers) {
        arbitrumStakers.stakers.forEach((staker) => {
            const key = (0, address_1.getAddress)(staker.id);
            const stakedAmount = parseFloat((0, units_1.formatUnits)(staker.totalStakedAmount, options.decimals));
            if (!!score[key]) {
                score[key] += stakedAmount;
            }
            else {
                score[key] = stakedAmount;
            }
        });
    }
    return score || {};
}
exports.strategy = strategy;
