"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const FLASHSTAKE_SUBGRAPH_URL = {
    '1': 'https://score-api.wanakafarm.com/land-ingame/graphql',
    '56': 'https://score-api.wanakafarm.com/land-ingame/graphql'
};
exports.author = 'TranTien139';
exports.version = '0.1.0';
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const params = {
        balances: {
            __args: {},
            address: true,
            point: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.balances.__args.block = snapshot;
    }
    if (addresses && addresses?.length > 0) {
        // @ts-ignore
        params.balances.__args.addresses = addresses;
    }
    const result = await (0, utils_1.subgraphRequest)(FLASHSTAKE_SUBGRAPH_URL[network], params);
    const score = {};
    if (result && result.balances) {
        result.balances.map((_data) => {
            const address = (0, address_1.getAddress)(_data.address);
            score[address] = Number(_data.point);
        });
    }
    return score || {};
}
exports.strategy = strategy;
