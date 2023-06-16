"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategy = exports.version = exports.author = void 0;
const utils_1 = require("../../utils");
exports.author = 'candoizo';
exports.version = '0.1.2';
const AAVEGOTCHI_SUBGRAPH_URL = {
    137: 'https://subgraph.satsuma-prod.com/tWYl5n5y04oz/aavegotchi/aavegotchi-core-matic/api'
};
const maxResponsePerQuery = 1000;
// agip 17: Voting power of 0.5 GHST/pixel
const realmSizeVotePower = {
    0: 32,
    1: 128,
    2: 1028,
    3: 1028,
    4: 2048 // partner
};
async function strategy(_space, network, provider, addresses, options, snapshot) {
    const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';
    const args = {
        where: {
            id_in: addresses.map((addr) => addr.toLowerCase())
        },
        first: addresses.length
    };
    if (blockTag !== 'latest')
        args.block = { number: blockTag };
    const batchQuery = (i) => {
        return {
            ['parcelsOwned_' + i]: {
                __aliasFor: 'parcelsOwned',
                __args: {
                    first: maxResponsePerQuery,
                    skip: maxResponsePerQuery * i
                },
                size: true
            }
        };
    };
    let parcelsOwnedQueryParams = {
        users: {
            __args: args,
            id: true
        }
    };
    for (let i = 0; i < 6; i++) {
        parcelsOwnedQueryParams = {
            ...parcelsOwnedQueryParams,
            users: {
                ...parcelsOwnedQueryParams.users,
                ...batchQuery(i)
            }
        };
    }
    const result = await (0, utils_1.subgraphRequest)(AAVEGOTCHI_SUBGRAPH_URL[network], parcelsOwnedQueryParams);
    const userToInfo = Object.fromEntries(result.users.map((user) => {
        return [user.id, user];
    }));
    return Object.fromEntries(addresses.map((addr) => {
        let realmVotingPowerValue = 0;
        const res = userToInfo[addr.toLowerCase()];
        if (res) {
            const parcelsOwned = Object.entries(res)
                .map(([key, val]) => {
                if (key.startsWith('parcelsOwned'))
                    return val;
                else
                    return [];
            })
                .flat(1);
            if (parcelsOwned.length > 0) {
                parcelsOwned.map((r) => {
                    let votePower = realmSizeVotePower[r.size];
                    if (isNaN(votePower))
                        votePower = 0;
                    realmVotingPowerValue += votePower;
                });
            }
        }
        return [addr, realmVotingPowerValue];
    }));
}
exports.strategy = strategy;
