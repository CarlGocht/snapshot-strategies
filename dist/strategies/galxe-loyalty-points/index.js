"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const console_1 = require("console");
exports.author = 'HaynarCool';
exports.version = '0.1.0';
const graphqlUrl = 'https://graphigo.prd.galaxy.eco/query';
async function strategy(space, network, provider, addresses, options, snapshot) {
    const url = new URL(options.space_url);
    const parts = url.pathname.split('/');
    if (parts.length < 2) {
        throw (0, console_1.error)('invalid galxe space url');
    }
    const graphqlParams = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            operationName: 'galxeLoyaltyPoints',
            query: `query galxeLoyaltyPoints($alias: String! $addresses: [String!]! $snapshotId: String!) {
        space(alias: $alias) {
          addressesLoyaltyPoints(addresses: $addresses, snapshotId: $snapshotId) {
            address
            space
            points
          }
        }
      }`,
            variables: {
                alias: parts[1],
                addresses: addresses,
                snapshotId: options.snapshot_id
                    ? options.snapshot_id
                    : typeof snapshot === 'number'
                        ? snapshot
                        : ''
            }
        })
    };
    const graphqlData = await (0, cross_fetch_1.default)(graphqlUrl, graphqlParams)
        .then((r) => r.json())
        .catch((e) => {
        console.error('query galxe user loyalty points failed');
        throw e;
    });
    const scores = {};
    graphqlData.data.space.addressesLoyaltyPoints.forEach((item) => {
        scores[item.address] = item.points;
    });
    return scores;
}
exports.strategy = strategy;
