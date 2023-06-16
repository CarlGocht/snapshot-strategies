"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const DGENESIS_SUBGRAPH_URL = {
    '42161': 'https://api.thegraph.com/subgraphs/name/callikai/dgenesisarbitrum'
};
exports.author = 'callikai';
exports.version = '0.1.0';
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const params = {
        tokenUsers: {
            __args: {
                where: {
                    id_in: addresses.map((address) => address.toLowerCase())
                },
                first: 1000
            },
            id: true,
            totalBalance: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.tokenUsers.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(DGENESIS_SUBGRAPH_URL[network], params);
    const score = {};
    if (result && result.tokenUsers) {
        result.tokenUsers.map((_data) => {
            const address = (0, address_1.getAddress)(_data.id);
            score[address] = Number((0, units_1.formatUnits)(bignumber_1.BigNumber.from(_data.totalBalance), 18));
        });
    }
    return score || {};
}
exports.strategy = strategy;
