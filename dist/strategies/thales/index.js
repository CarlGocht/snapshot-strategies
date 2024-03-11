"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
exports.author = 'vpoklopic';
exports.version = '1.0.4';
var NetworkId;
(function (NetworkId) {
    NetworkId[NetworkId["Optimism"] = 10] = "Optimism";
    NetworkId[NetworkId["Arbitrum"] = 42161] = "Arbitrum";
    NetworkId[NetworkId["Base"] = 8453] = "Base";
})(NetworkId || (NetworkId = {}));
const THALES_SUBGRAPH_URL = {
    optimism: 'https://api.thegraph.com/subgraphs/name/thales-markets/thales-token',
    arbitrum: 'https://api.thegraph.com/subgraphs/name/thales-markets/thales-token-arbitrum',
    base: 'https://api.studio.thegraph.com/query/11948/thales-token-base/version/latest'
};
function returnGraphParams(addresses, block) {
    const graphParams = {
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
    if (block !== 'latest') {
        // @ts-ignore
        graphParams.stakers.__args.block = {
            number: block
        };
    }
    return graphParams;
}
async function strategy(_space, _network, _provider, addresses, options, snapshot) {
    const blocks = await (0, utils_1.getSnapshots)(_network, snapshot, _provider, [
        NetworkId.Optimism,
        NetworkId.Arbitrum,
        NetworkId.Base
    ]);
    const optimismGraphParams = returnGraphParams(addresses, blocks[NetworkId.Optimism]);
    const arbitrumGraphParams = returnGraphParams(addresses, blocks[NetworkId.Arbitrum]);
    const baseGraphParams = returnGraphParams(addresses, blocks[NetworkId.Base]);
    const score = {};
    const [optimismStakers, arbitrumStakers, baseStakers] = await Promise.all([
        (0, utils_1.subgraphRequest)(THALES_SUBGRAPH_URL.optimism, optimismGraphParams),
        (0, utils_1.subgraphRequest)(THALES_SUBGRAPH_URL.arbitrum, arbitrumGraphParams),
        (0, utils_1.subgraphRequest)(THALES_SUBGRAPH_URL.base, baseGraphParams)
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
    // If the Optimism or Arbitrum staker is also staker on Base, add an amount
    // Otherwise, just set Base staked amount as a score
    if (baseStakers && baseStakers.stakers) {
        baseStakers.stakers.forEach((staker) => {
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
