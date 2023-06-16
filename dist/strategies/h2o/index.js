"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
exports.author = 'MantisClone';
exports.version = '0.1.0';
const SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/h2odata/h2o-mainnet'
};
async function strategy(space, network, provider, addresses, options, snapshot) {
    const params = {
        users: {
            id: true,
            safes: {
                collateralType: {
                    __args: {
                        where: {
                            id: options.collateralTypeId
                        }
                    }
                },
                collateral: true
            }
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.users.__args = { block: { number: snapshot } };
    }
    const result = await (0, utils_1.subgraphRequest)(SUBGRAPH_URL[network], params);
    return Object.fromEntries(result.users.map((user) => [
        (0, address_1.getAddress)(user.id),
        user.safes.reduce((partialSum, safe) => partialSum + parseFloat(safe.collateral), 0)
    ]));
}
exports.strategy = strategy;
