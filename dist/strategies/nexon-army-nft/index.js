"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.SUBGRAPH_URL = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'nexonfidev';
exports.version = '0.1.0';
const LIMIT = 1000;
exports.SUBGRAPH_URL = {
    '137': 'https://api.thegraph.com/subgraphs/name/nexon-finance/nexon-army-nft'
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const blockNumber = typeof snapshot === 'number'
        ? snapshot
        : (await provider.getBlock('latest')).number;
    const _addresses = addresses.map((x) => x.toLowerCase());
    const addressSubsets = Array.apply(null, Array(Math.ceil(_addresses.length / LIMIT))).map((_e, i) => _addresses.slice(i * LIMIT, (i + 1) * LIMIT));
    const returnedFromSubgraph = await Promise.all(addressSubsets.map((subset) => (0, utils_1.subgraphRequest)(exports.SUBGRAPH_URL[network], makeQuery(blockNumber, subset))));
    const subgraphResult = returnedFromSubgraph
        .map((x) => x.votingWeights)
        .flat();
    if (!subgraphResult)
        return;
    const score = {};
    subgraphResult.forEach((owner) => {
        if (!score[(0, address_1.getAddress)(owner.address)]) {
            score[(0, address_1.getAddress)(owner.address)] = parseFloat(owner.weight);
        }
    });
    return score;
}
exports.strategy = strategy;
function makeQuery(snapshot, addressSet) {
    const query = {
        votingWeights: {
            __args: {
                where: {
                    address_in: addressSet,
                    block_lte: snapshot
                },
                orderBy: 'block',
                orderDirection: 'desc',
                first: LIMIT
            },
            address: true,
            weight: true
        }
    };
    return query;
}
