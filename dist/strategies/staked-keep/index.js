"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const KEEP_SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/miracle2k/all-the-keeps'
};
exports.author = 'corollari';
exports.version = '0.1.0';
async function strategy(_space, network, _provider, addresses, _options, snapshot) {
    const params = {
        operators: {
            __args: {
                where: {
                    owner_in: addresses.map((address) => address.toLowerCase())
                },
                first: 1000
            },
            owner: true,
            stakedAmount: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.operators.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(KEEP_SUBGRAPH_URL[network], params);
    const score = {};
    if (result && result.operators) {
        result.operators.forEach((op) => {
            const userAddress = (0, address_1.getAddress)(op.owner);
            if (!score[userAddress])
                score[userAddress] = 0;
            score[userAddress] = score[userAddress] + Number(op.stakedAmount);
        });
    }
    return score;
}
exports.strategy = strategy;
