"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const utils_1 = require("../../utils");
exports.author = 'ChaituVR';
exports.version = '0.1.0';
const getJWT = async (dfuseApiKey) => {
    const rawResponse = await (0, cross_fetch_1.default)('https://auth.dfuse.io/v1/auth/issue', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ api_key: dfuseApiKey })
    });
    const content = await rawResponse.json();
    return content.token;
};
async function strategy(space, network, provider, addresses, options) {
    let data = [];
    const query = Object.fromEntries(addresses.map((address) => [
        `_${address}`,
        {
            __aliasFor: 'searchTransactions',
            __args: {
                indexName: new json_to_graphql_query_1.EnumType('CALLS'),
                query: `(from:${address} OR to:${address})`,
                sort: new json_to_graphql_query_1.EnumType('ASC'),
                limit: 1
            },
            edges: {
                block: {
                    header: {
                        timestamp: true
                    },
                    number: true
                },
                node: {
                    from: true,
                    to: true
                }
            }
        }
    ]));
    const dfuseJWT = await getJWT(options.dfuseApiKey || 'web_f527db575a38dd11c5b686d7da54d371');
    data = await (0, utils_1.subgraphRequest)('https://mainnet.eth.dfuse.io/graphql', query, {
        headers: {
            Authorization: `Bearer ${dfuseJWT}`
        }
    });
    return Object.fromEntries(Object.values(data).map((value, i) => [
        addresses[i],
        (() => {
            const today = new Date().getTime();
            const firstTransaction = value.edges[0]?.block?.header?.timestamp || today;
            const diffInSeconds = Math.abs(firstTransaction - today);
            const walletAgeInDays = Math.floor(diffInSeconds / 1000 / 60 / 60 / 24);
            return walletAgeInDays;
        })()
    ]));
}
exports.strategy = strategy;
