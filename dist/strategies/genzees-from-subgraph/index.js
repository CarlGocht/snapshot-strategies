"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'alephao';
exports.version = '0.1.0';
const LIMIT = 500;
function makeQuery(snapshot, addressSet) {
    const query = {
        users: {
            __args: {
                where: {
                    id_in: addressSet
                },
                first: LIMIT
            },
            id: true,
            genzeeBalance: true
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        query.users.__args.block = { number: snapshot };
    }
    return query;
}
async function strategy(_space, _network, _provider, addresses, options, snapshot) {
    const _addresses = addresses.map((x) => x.toLowerCase());
    const addressSubsets = Array.apply(null, Array(Math.ceil(_addresses.length / LIMIT))).map((_e, i) => _addresses.slice(i * LIMIT, (i + 1) * LIMIT));
    const returnedFromSubgraph = await Promise.all(addressSubsets.map((subset) => (0, utils_1.subgraphRequest)(options.graph, makeQuery(snapshot, subset))));
    const result = returnedFromSubgraph.map((x) => x.users).flat();
    const scores = {};
    addresses.forEach((address) => {
        const account = result.filter((x) => x.id == address.toLowerCase())[0];
        let score = 0;
        if (account) {
            score = parseFloat(account.genzeeBalance);
        }
        scores[address] = score;
    });
    return scores || {};
}
exports.strategy = strategy;
