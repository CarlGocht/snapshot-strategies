"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const units_1 = require("@ethersproject/units");
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'nginnever';
exports.version = '0.1.1';
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const adds = addresses.map((element) => {
        return element.toLowerCase();
    });
    const params = {
        users: {
            __args: {
                where: { id_in: adds },
                first: 1000
            },
            id: true,
            voteWeight: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.users.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(options.SUBGRAPH_URL, params);
    const score = {};
    result.users.map((user) => {
        score[(0, address_1.getAddress)(user.id)] = parseFloat((0, units_1.formatUnits)(user.voteWeight, 18));
    });
    return score || {};
}
exports.strategy = strategy;
