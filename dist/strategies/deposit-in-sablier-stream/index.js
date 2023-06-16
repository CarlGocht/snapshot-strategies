"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const units_1 = require("@ethersproject/units");
const utils_1 = require("../../utils");
const SUBGRAPH_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier',
    '3': 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-ropsten',
    '4': 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-rinkeby',
    '5': 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-goerli',
    '10': 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-optimism',
    '42': 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-kovan',
    '56': 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-bsc',
    '137': 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-matic',
    '42161': 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-arbitrum',
    '43114': 'https://api.thegraph.com/subgraphs/name/sablierhq/sablier-avalanche' // avalanche
};
exports.author = 'dan13ram';
exports.version = '0.1.0';
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const params = {
        streams: {
            __args: {
                limit: 1000,
                where: {
                    recipient_in: addresses.map((address) => address.toLowerCase()),
                    sender: options.sender.toLowerCase(),
                    token: options.token.toLowerCase(),
                    cancellation: null
                }
            },
            recipient: true,
            deposit: true,
            token: {
                decimals: true
            }
        }
    };
    if (snapshot !== 'latest') {
        // @ts-ignore
        params.streams.__args.block = { number: snapshot };
    }
    const result = await (0, utils_1.subgraphRequest)(options.subGraphURL ? options.subGraphURL : SUBGRAPH_URL[network], params);
    const score = Object.fromEntries(addresses.map((address) => [(0, address_1.getAddress)(address), 0]));
    if (result && result.streams) {
        result.streams.forEach((stream) => {
            const userAddress = (0, address_1.getAddress)(stream.recipient);
            const userScore = parseFloat((0, units_1.formatUnits)(stream.deposit, stream.token.decimals));
            score[userAddress] = score[userAddress] + userScore;
        });
    }
    return score;
}
exports.strategy = strategy;
