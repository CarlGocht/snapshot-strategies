"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/dinngodev/furucombo-tokenomics-mainnet',
    '137': 'https://api.thegraph.com/subgraphs/name/dinngodev/furucombo-tokenomics-polygon'
};
exports.author = 'weizard';
exports.version = '0.1.0';
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const params = {
        users: {
            __args: {
                where: {
                    id_in: addresses.map((address) => address.toLowerCase()),
                    amount_gt: 0
                }
            },
            id: true,
            amount: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.users.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(options.subGraphURL ? options.subGraphURL : SUBGRAPH_URL[network], params);
    const score = {};
    if (result && result.users) {
        result.users.forEach((user) => {
            const userAddress = (0, address_1.getAddress)(user.id);
            let userScore = Number(user.amount);
            if (options.scoreMultiplier) {
                userScore = userScore * options.scoreMultiplier;
            }
            if (!score[userAddress])
                score[userAddress] = 0;
            score[userAddress] = score[userAddress] + userScore;
        });
    }
    return score || {};
}
exports.strategy = strategy;
