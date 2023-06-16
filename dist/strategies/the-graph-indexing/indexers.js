"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexersStrategy = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("../../utils");
const graphUtils_1 = require("../the-graph/graphUtils");
async function indexersStrategy(_space, network, _provider, addresses, options, snapshot) {
    const indexersParams = {
        graphAccounts: {
            __args: {
                where: {
                    id_in: addresses
                },
                first: options.pageSize
            },
            id: true,
            indexer: {
                stakedTokens: true
            }
        },
        graphNetworks: {
            __args: {
                first: options.pageSize
            },
            totalSupply: true,
            totalDelegatedTokens: true,
            totalTokensStaked: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        indexersParams.graphAccounts.__args.block = { number: snapshot };
        // @ts-ignore
        indexersParams.graphNetworks.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(graphUtils_1.GRAPH_NETWORK_SUBGRAPH_URL[network], indexersParams);
    const score = {};
    let normalizationFactor = 0;
    if (result && result.graphNetworks) {
        const nonStakedTokens = (0, graphUtils_1.calcNonStakedTokens)(result.graphNetworks[0].totalSupply, result.graphNetworks[0].totalTokensStaked, result.graphNetworks[0].totalDelegatedTokens);
        // The normalization factor gives more weight to staked GRT
        // over GRT holded
        normalizationFactor =
            nonStakedTokens /
                bignumber_1.BigNumber.from(result.graphNetworks[0].totalTokensStaked)
                    .div(graphUtils_1.bnWEI)
                    .toNumber();
    }
    if (options.expectedResults && snapshot !== 'latest') {
        (0, graphUtils_1.verifyResults)(normalizationFactor.toString(), options.expectedResults.normalizationFactor.toString(), 'Normalization factor');
    }
    if (result && result.graphAccounts) {
        addresses.forEach((a) => {
            let indexerScore = 0;
            for (let i = 0; i < result.graphAccounts.length; i++) {
                if (result.graphAccounts[i].id == a) {
                    if (result.graphAccounts[i].indexer != null) {
                        const indexerTokens = bignumber_1.BigNumber.from(result.graphAccounts[i].indexer.stakedTokens);
                        indexerScore =
                            indexerTokens.div(graphUtils_1.bnWEI).toNumber() * normalizationFactor;
                    }
                    break;
                }
            }
            score[a] = indexerScore;
        });
    }
    else {
        console.error('Subgraph request failed');
    }
    return score || {};
}
exports.indexersStrategy = indexersStrategy;
