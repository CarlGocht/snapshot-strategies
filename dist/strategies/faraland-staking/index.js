"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const FLASHSTAKE_SUBGRAPH_URL = {
    '1': 'https://queries-graphnode.faraland.io/subgraphs/name/edwardevans094/farastore-v12',
    '56': 'https://queries-graphnode.faraland.io/subgraphs/name/edwardevans094/farastore-v12'
};
exports.author = 'edwardEvans094';
exports.version = '0.1.0';
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const params = {
        users: {
            __args: {
                where: {
                    id_in: addresses.map((address) => address.toLowerCase())
                },
                first: 1000
            },
            id: true,
            totalStaked: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.users.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(FLASHSTAKE_SUBGRAPH_URL[network], params);
    const score = {};
    if (result && result.users) {
        result.users.map((_data) => {
            const address = (0, address_1.getAddress)(_data.id);
            score[address] = Number(_data.totalStaked);
        });
    }
    return score || {};
}
exports.strategy = strategy;
