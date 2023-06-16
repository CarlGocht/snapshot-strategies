"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const cross_fetch_1 = __importDefault(require("cross-fetch"));
exports.author = 'tempest-sol';
exports.version = '0.1.1';
async function strategy(space, network, provider, addresses) {
    const count = {};
    const res = await (0, cross_fetch_1.default)('https://open-api.etherorcs.com/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: `query(
        $orcsFilter: FilterFindManyorcsInput
        ) {
        orcs(filter: $orcsFilter) {
          _id
          owner
        }
        }`,
            variables: {
                orcsFilter: {
                    OR: addresses.map((address) => ({ owner: address.toLowerCase() }))
                }
            }
        })
    });
    const response = await res.json();
    if (response && response.data) {
        const orcs = response.data.orcs;
        addresses.forEach((address) => {
            count[address] = orcs.filter((orc) => orc.owner.toLowerCase() === address.toLowerCase()).length;
        });
    }
    return count || {};
}
exports.strategy = strategy;
