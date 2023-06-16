"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.examples = exports.version = exports.author = void 0;
const address_1 = require("@ethersproject/address");
const utils_1 = require("../../utils");
const examples_json_1 = __importDefault(require("./examples.json"));
exports.author = 'gawainb';
exports.version = '1.1.0';
exports.examples = examples_json_1.default;
const POAP_API_ENDPOINT_URL = {
    '1': 'https://api.thegraph.com/subgraphs/name/poap-xyz/poap',
    '100': 'https://api.thegraph.com/subgraphs/name/poap-xyz/poap-xdai'
};
const getTokenSupply = {
    tokens: {
        __args: {
            block: undefined,
            where: {
                id_in: undefined
            }
        },
        event: {
            tokenCount: true
        },
        id: true,
        owner: {
            id: true
        }
    }
};
async function strategy(_space, network, _provider, addresses, options, snapshot) {
    const addressesMap = addresses.reduce((map, address) => {
        map[(0, address_1.getAddress)(address)] = 0;
        return map;
    }, {});
    // Set TokenIds as arguments for GQL query
    getTokenSupply.tokens.__args.where.id_in = options.tokenIds.map((token) => token.id);
    if (snapshot !== 'latest') {
        getTokenSupply.tokens.__args.block = { number: snapshot };
    }
    const supplyResponse = await (0, utils_1.subgraphRequest)(POAP_API_ENDPOINT_URL[network], getTokenSupply);
    if (supplyResponse && supplyResponse.tokens) {
        const tokenIdsWeightMap = options.tokenIds.reduce((map, { id, weight }) => {
            map[id] = weight;
            return map;
        }, {});
        supplyResponse.tokens.forEach((token) => {
            const checksumAddress = (0, address_1.getAddress)(token.owner.id);
            if (!addressesMap[checksumAddress])
                addressesMap[checksumAddress] = 0;
            addressesMap[checksumAddress] +=
                tokenIdsWeightMap[token.id] * parseInt(token.event.tokenCount);
        });
    }
    return addressesMap;
}
exports.strategy = strategy;
