"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delegatorsStrategy = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
const graphUtils_1 = require("../the-graph/graphUtils");
async function delegatorsStrategy(_space, network, _provider, addresses, options, snapshot) {
    const delegatorsParams = {
        graphAccounts: {
            __args: {
                where: {
                    id_in: addresses
                },
                first: options.pageSize
            },
            id: true,
            delegator: {
                stakes: {
                    shareAmount: true,
                    lockedTokens: true,
                    indexer: {
                        delegationExchangeRate: true
                    }
                }
            }
        },
        graphNetworks: {
            __args: {
                first: 1000
            },
            totalSupply: true,
            totalDelegatedTokens: true,
            totalTokensStaked: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        delegatorsParams.graphAccounts.__args.block = { number: snapshot };
        // @ts-ignore
        delegatorsParams.graphNetworks.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(graphUtils_1.GRAPH_NETWORK_SUBGRAPH_URL[network], delegatorsParams);
    const score = {};
    let normalizationFactor = 0;
    if (result && result.graphNetworks) {
        const nonStakedTokens = (0, graphUtils_1.calcNonStakedTokens)(result.graphNetworks[0].totalSupply, result.graphNetworks[0].totalTokensStaked, result.graphNetworks[0].totalDelegatedTokens);
        // The normalization factor gives more weight to delegated stake
        // over GRT holded
        normalizationFactor =
            nonStakedTokens /
                bignumber_1.BigNumber.from(result.graphNetworks[0].totalDelegatedTokens)
                    .div(graphUtils_1.bnWEI)
                    .toNumber();
    }
    if (options.expectedResults && snapshot !== 'latest') {
        (0, graphUtils_1.verifyResults)(normalizationFactor.toString(), options.expectedResults.normalizationFactor.toString(), 'Normalization factor');
    }
    if (result && result.graphAccounts) {
        addresses.forEach((a) => {
            let delegationScore = 0;
            for (let i = 0; i < result.graphAccounts.length; i++) {
                if (result.graphAccounts[i].id == a) {
                    if (result.graphAccounts[i].delegator != null) {
                        // Find all stakes from the delegator
                        // and sum the delegated and locked tokens for each
                        result.graphAccounts[i].delegator.stakes.forEach((s) => {
                            const delegatedTokens = (0, graphUtils_1.bdMulBn)(s.indexer.delegationExchangeRate, s.shareAmount);
                            const lockedTokens = bignumber_1.BigNumber.from(s.lockedTokens);
                            const oneDelegationScore = delegatedTokens
                                .add(lockedTokens)
                                .div(graphUtils_1.bnWEI)
                                .toNumber();
                            delegationScore = delegationScore + oneDelegationScore;
                        });
                        // Apply normalization factor to the total delegated GRT
                        delegationScore = delegationScore * normalizationFactor;
                    }
                    break;
                }
            }
            score[a] = delegationScore;
        });
    }
    else {
        console.error('Subgraph request failed');
    }
    return score || {};
}
exports.delegatorsStrategy = delegatorsStrategy;
