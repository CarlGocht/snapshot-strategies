"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
exports.author = 'Badgeth';
exports.version = '0.1.0';
const BADGETH_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/hardforksoverknives/badgeth-dev';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const params = {
        voters: {
            __args: {
                where: {
                    id_in: addresses,
                    votingPower_gt: 0
                },
                first: 1000,
                orderBy: 'votingPower',
                orderDirection: 'desc'
            },
            id: true,
            votingPower: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.voters.__args.block = { number: snapshot };
    }
    const score = {};
    const result = await (0, utils_1.subgraphRequest)(BADGETH_SUBGRAPH_URL, params);
    if (result && result.voters) {
        result.voters.forEach((voter) => {
            score[(0, address_1.getAddress)(voter.id)] = parseInt(voter.votingPower);
        });
    }
    return score || {};
}
exports.strategy = strategy;
