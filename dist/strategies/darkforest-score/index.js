"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
const address_1 = require("@ethersproject/address");
exports.author = 'cha0sg0d';
exports.version = '0.1.0';
const calcScore = (score) => {
    return score == 0 ? 0 : Math.floor(Math.log2(score));
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const DF_SUBGRAPH_URL = options.graph_url;
    const params = {
        players: {
            __args: {
                where: {
                    id_in: addresses.map((addr) => addr.toLowerCase())
                },
                first: 1000
            },
            id: true,
            score: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.players.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(DF_SUBGRAPH_URL, {
        ...params
    });
    return Object.fromEntries(result.players.map((p) => [(0, address_1.getAddress)(p.id), calcScore(parseInt(p.score))]));
}
exports.strategy = strategy;
